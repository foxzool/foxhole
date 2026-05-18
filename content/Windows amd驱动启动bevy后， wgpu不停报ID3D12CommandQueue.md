---
Status: 🌲
tags:
  - note
Links:
  - "[[Bevy MOC]]"
Created: 2024-12-01T15:13:44
BevyVersion: "0.15"
share: true
---

Windows Amd显卡下 ， 跑bevy一直出现
``` rust
wgpu_hal::auxil::dxgi::exception: ID3D12CommandQueue::ExecuteCommandLists: Using ClearRenderTargetView on Command List (0x00000155BEC0B050:'Unnamed ID3D12GraphicsCommandList Object'): Resource state (0x0: D3D12
_RESOURCE_STATE_[COMMON|PRESENT]) of resource (0x00000155BEBBA990:'Unnamed ID3D12Resource Object') (subresource: 0) is invalid for use as a render target.  Expected State Bits (all): 0x4: D3D12_RESOURCE_STATE_RENDER_TARGET, Actual State: 0x0: D3D12_RESOURCE_STATE_[COMMON|PRESENT], Missing State: 0x4: D3D12_RESOURCE_STATE_RENDER_TARGET. [ EXECUTION ERROR #538: INVALID_SUBRESOURCE_STATE]

```

这样的错误， 原因来源 https://github.com/gfx-rs/wgpu/issues/4247

处理方法:

添加环境变量 `WGPU_BACKEND=vulkan`