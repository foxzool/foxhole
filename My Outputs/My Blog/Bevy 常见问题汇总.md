---
Status: 🌱
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-08-25T11:21:00
BevyVersion:
  - "0.16"
share:
---
# 窗口

## 如何更改背景颜色
修改  ClearColor 
```rust
 app.insert_resource(ClearColor(Color::srgb(0.5, 0.5, 0.9)))
```
## 如何修改窗口标题/分辨率
设置WindowPlugin
```rust
.add_plugins(  
    DefaultPlugins.set(WindowPlugin {  
        primary_window: Some(Window {  
            title: "I am a window!".into(),  
            resolution: (500., 300.).into(),
		..default()  
		}),  
	..default()
})
```

# 字体
https://github.com/notofonts/noto-cjk

# 附件

## 如何调整文件加载地址
```rust
app.set(AssetPlugin {  
    file_path: "../../assets".to_string(),  
    ..Default::default()  
}),
```

# ECS
## 删除实体
``` rust
    // 删除实体以及它的子实体
	entity.destroy();
	
	// 删除实体的关联实体, 实体不删除
	entity.despawn_related()
```