---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2025-03-04T18:44:26
BevyVersion:
  - "0.15"
share: true
---
## 同步的ECS系统
在Bevy ECS系统中的`System`都是同步的，通过系统调度器按照顺序并发执行系统。
[System的定义](https://docs.rs/bevy/latest/bevy/ecs/prelude/trait.System.html)
```
pub trait System:
    Send
    + Sync
    + 'static {
    type In: SystemInput;
    type Out;
```
目前版本(0.15)来说，Bevy 还不支持 async system。
但一些异步运行时的库， 如reqwest, sqlx等，或者一些需要长时间在后台运行的程序， 在Bevy 中如何使用呢？

## 方案1:  通道(Channel)
参考官方例程 [external_source_external_thread](https://github.com/bevyengine/bevy/blob/latest/examples/async_tasks/external_source_external_thread.rs)
先在Startup时，用类似crossbeam-channel的库建立tx,rx， 通过标准的std::thread::spawn建立后台运行线程。将接收rx通过Resource分享出去。
``` rust
	let (tx, rx) = bounded::<u32>(1);
    std::thread::spawn(move || {
        // We're seeding the PRNG here to make this example deterministic for testing purposes.
        // This isn't strictly required in practical use unless you need your app to be deterministic.
        let mut rng = ChaCha8Rng::seed_from_u64(19878367467713);
        loop {
            // Everything here happens in another thread
            // This is where you could connect to an external data source

            // This will block until the previous value has been read in system `read_stream`
            tx.send(rng.gen_range(0..2000)).unwrap();
        }
    });

    commands.insert_resource(StreamReceiver(rx));
```
 然后用一个System一直接收Rx的消息，注意这里用了没有堵塞的`try_iter`
``` rust 
// This system reads from the receiver and sends events to Bevy  
fn read_stream(receiver: Res<StreamReceiver>, mut events: EventWriter<StreamEvent>) {  
    for from_stream in receiver.try_iter() {  
        events.send(StreamEvent(from_stream));  
    }  
}
```

## 方案2:  async-std
bevy内置了一个[bevy_tasks](https://docs.rs/bevy_tasks/latest/bevy_tasks/)线程池，它是基于async-std的运行时，内置了三种线程池：[`AsyncComputeTaskPool`](https://docs.rs/bevy_tasks/latest/bevy_tasks/struct.AsyncComputeTaskPool.html), [`ComputeTaskPool`](https://docs.rs/bevy_tasks/latest/bevy_tasks/struct.ComputeTaskPool.html)和[`IoTaskPool`](https://docs.rs/bevy_tasks/latest/bevy_tasks/struct.IoTaskPool.html) .
注意： BevyTasks不支持WebAssembly, 并且要开启bevy feature `multi_threaded`

### AsyncComputeTaskPool
如果所运行的任务是CPU密集型，但不需要在下一帧前完成，就使用`AsyncComputeTaskPool`。
参考官方例程 [async_compute](https://github.com/bevyengine/bevy/blob/latest/examples/async_tasks/async_compute.rs)
``` rust
fn spawn_tasks(mut commands: Commands) {
    let thread_pool = AsyncComputeTaskPool::get();
	let task = thread_pool.spawn(async move {    
		// 异步运算的结果
		// 
	
		let mut command_queue = CommandQueue::default();
		command_queue.push(move |world: &mut World| {
			// 拿到ecs world后进行处理，比如说spawn, insert等。
		});

		command_queue
    });

	commands.entity(entity).insert(ComputeTransform(task));
}                    
``` rust
struct Task<T>(async_executor::Task<T>)
```
然后在另一个system里poll task, 获取结果
``` rust
fn handle_tasks(mut commands: Commands, mut transform_tasks: Query<&mut ComputeTransform>) {  
    for mut task in &mut transform_tasks {  
        if let Some(mut commands_queue) = block_on(future::poll_once(&mut task.0)) {  
            commands.append(&mut commands_queue);  
        }  
    }  
}
```
总结: `AsyncComputeTaskPool`使用了`async-std`运行时， 生成一个async_executor::Task, 然后通过ECS的system一直poll来获取异步运算结果。

### ComputeTaskPool
如果运行任务是CPU敏感性， 必须在当前帧计算完成，就用`ComputeTaskPool`
实际上bevy ecs里的并行查询就用了`ComputeTaskpool`。
``` rust
fn move_system(mut sprites: Query<(&mut Transform, &Velocity)>) {  
 // 这里的par_iter_mut就是并行查询修改，官方说法是， 如果相关实体不超过128个时， 并行方法不会比常规的迭代器查询快
 sprites  
        .par_iter_mut()  
        .for_each(|(mut transform, velocity)| {  
            transform.translation += velocity.extend(0.0);  
        });  
}
```

### IoTaskPool
可以快速完成的IO 敏感的任务， 可以使用`IoTaskPool`.
比如说保存Scene
``` rust
IoTaskPool::get()  
    .spawn(async move {  
        // Write the scene RON data to file  
        File::create(format!("assets/{NEW_SCENE_FILE_PATH}"))  
            .and_then(|mut file| file.write(serialized_scene.as_bytes()))  
            .expect("Error while writing scene to file");  
    })  
    .detach();
```

### 线程池管理
Bevy的线程池由`TaskPoolPlugin`管理， 默认使用机器当前的逻辑核数量为线程数。
也可以通过下面的方式限制:
``` rust
.add_plugins(DefaultPlugins.set(TaskPoolPlugin {  
    task_pool_options: TaskPoolOptions::with_num_threads(4),  
}))
```
IoTaskPool, AsyncComputeTaskPool 各分到25%的线程数，但不超过4个。剩下的归于 ComputeTaskPool.

以上三种线程池通过下面的函数在主线程运行,最多同时运行100个任务。
``` rust
pub fn tick_global_task_pools_on_main_thread() {  
    COMPUTE_TASK_POOL  
        .get()  
        .unwrap()  
        .with_local_executor(|compute_local_executor| {  
            ASYNC_COMPUTE_TASK_POOL  
                .get()  
                .unwrap()  
                .with_local_executor(|async_local_executor| {  
                    IO_TASK_POOL  
                        .get()  
                        .unwrap()  
                        .with_local_executor(|io_local_executor| {  
                            for _ in 0..100 {  
                                compute_local_executor.try_tick();  
                                async_local_executor.try_tick();  
                                io_local_executor.try_tick();  
                            }  
                        });  
                });  
        });  
}
```

## 方案3:  Tokio
tokio是目前rust生态里比较主流的异步运行时。有两种方式使用。
### 手动管理runtime
建立一个Resource存储runtime
``` rust
#[derive(Resource)]
pub struct TokioRuntime(Box<Runtime>)

/// 在App Startup时创建
fn setup_tokio_runtime(mut commands: Commands) {
    #[cfg(not(target_arch = "wasm32"))]
    let runtime = tokio::runtime::Builder::new_multi_thread();
    #[cfg(target_arch = "wasm32")]
    let runtime = tokio::runtime::Builder::new_current_thread();
    
    let runtime = runtime
        .enable_all()
        .build()
        .expect("Failed to create Tokio runtime for background tasks");
        
    commands.insert_resource(TokioRuntime(Box::new(runtime)));
}

```
在需要使用的system通过Resource拿tokio runtime
``` rust
fn some_system(rt: Res<TokioRuntime>) {
	rt.spawn( async move {
		// 异步任务返回结果可以通过通道传出。
	})
}
```

###  bevy-tokio-tasks
有一个第三方库[bevy-tokio-tasks](https://github.com/EkardNT/bevy-tokio-tasks)你可以帮你管理tokio runtime, 并且提供了一些辅助方法可以拿到主线程的world
``` rust
 fn demo(runtime: ResMut<TokioTasksRuntime>) {
    runtime.spawn_background_task(|mut ctx| async move {
        let mut color_index = 0;
        loop {
            ctx.run_on_main_thread(move |ctx| {
                if let Some(mut clear_color) = ctx.world.get_resource_mut::<ClearColor>() {
                    clear_color.0 = bevy::prelude::Color::Srgba(COLORS[color_index]);
                    println!("Changed clear color to {:?}", clear_color.0);
                }
            })
            .await;
            color_index = (color_index + 1) % COLORS.len();
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    });
}
```

## 错误处理
`bevy_tasks`返回是Task<T>， 所以可以考虑将Result<T，Error>返回后， 在system里再触发Error Event.
或者专门使用一个Error Channel 接受错误消息。

## 总结
* 对于简单的后台任务（如定时器、简单的网络请求），推荐使用方案1
* 对于需要与Bevy ECS深度集成的异步任务，推荐使用方案2
* 对于需要与大量Tokio生态库集成的复杂应用，推荐使用方案3