# Hero Poster Image 实现说明

## 文件位置

- 图片路径：`public/images/banner-hero-poster-01.jpg`
- 在代码中引用：`/images/banner-hero-poster-01.jpg`

## 图片规格要求

- 尺寸：1920x1080（16:9比例）
- 格式：JPG
- 质量：高质量，适合作为首屏背景
- 内容：与hero-background视频内容风格一致的静态图片

## 功能说明

- 用作video元素的poster属性
- 在视频加载期间显示，提供更好的用户体验
- 当视频加载失败时，会显示背景动画效果而不是poster

## 实现细节

video元素会根据不同状态显示：

1. 加载中：显示poster图片（banner-hero-poster-01.jpg）
2. 成功加载：显示视频内容，opacity为100%
3. 加载失败：隐藏视频（opacity为0），显示背景动画效果
