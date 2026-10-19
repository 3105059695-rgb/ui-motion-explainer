# 独立原创动效原语 / Independent authored primitives

这套机制由本项目独立编写。它提供可复用的时间函数和 12 个小型 UI 示范，不声称已经覆盖或复刻 Prompt Motion 的 230 个作品。案例库、原视频与这套原创原语是不同资产。

核心文件：`assets/motion-core.js`。浏览器使用 `window.MotionCore`；Node 使用 `require('./assets/motion-core.js')`。无外部依赖。

所有核心函数只依赖传入的时间、参数和固定种子。它们不读写 DOM，不读取实际时钟，不累积上一帧状态，不启动计时器，不使用 CSS transition。跳帧、倒序取样、重复调用应产生相同结果。时间单位为秒；坐标、尺寸单位由调用方统一定义。

| 机制 | 函数 | 关键参数 | 结果与用法 |
| --- | --- | --- | --- |
| 闭式弹簧 | `springState(t, options)` / `spring(t, options)` | `from,to,velocity,start,omega,damping` | 解析计算位置/速度；阻尼小于 1 为欠阻尼，等于 1 为临界阻尼，大于 1 为过阻尼。`omega` 为角频率，必须大于 0。 |
| 多目标轨迹 | `springTrack(t, events, options)` | `events:[{at,value,spring?}]`、`initial,omega,damping` | 把每次目标增量的阶跃响应相加；新目标不会重置前一段位置或速度。返回 `{value,velocity}`。每次调用都会拷贝并排序事件，不修改输入。 |
| 双边缘液态拉伸 | `liquidStretch(t, events, options)` | `initial,width,leadingDelay,trailingDelay` | 根据移动方向让领先边先出发、尾随边后追上。返回 `left,right,center,width`；适合共享标签指示器或开关旋钮。 |
| 贝塞尔光标与点击 | `cubicBezier(u,p0,p1,p2,p3)` / `cursorPath(t,options)` / `clickPress(t,options)` | 四个 `{x,y}` 控制点；`start,duration,clicks`；点击的 `at,duration,depth` | 光标路径返回 `x,y,press,scale`；点击形变返回 `press,scale,offsetY`，可让按钮与光标共用同一点击事件。 |
| 直接拖动与释放 | `directDrag(t,options)` | `from,to,min,max,start,duration,resistance,releaseVelocity` | 按住时由位置直接算值，越界乘以阻力；释放后从当前位置启动弹簧。返回 `value,raw,held,released,overshoot,fraction`。默认释放速度为 0；需要惯性时明确传入。 |
| 遮罩文字揭示 | `maskedType(t,options)` | `count,start,duration,stagger,travel` | 每行返回进度、纵向位移、透明度与底部遮罩比例。外层提供独立 clip/mask；每行有自己的开始时间。 |
| 形状漫灌 | `frameFlood(t,options)` | `width,height,anchor,start,duration` | 计算圆心到最远角点的覆盖半径，返回 `x,y,radius,progress,coverageRadius`。把同一个圆从触发点展开至整帧。 |
| 六叶光圈 | `iris(t,options)` | `count=6,outerRadius,aperture,start,duration,twist` | 返回每片叶子的顶点与 SVG `path`，孔径从 0 扩大。叶片为原创多边形模型；需要机械级叶片形状时可换几何而复用时间进度。 |
| 图表描边揭示 | `strokeReveal(t,options)` | `start,duration,length` | 返回 `progress,dasharray,dashoffset,clipWidth`。SVG 可设 `pathLength=1`，同时将 `length=1`；提示点应使用同一个进度。 |
| 共享对象交接 | `sharedHandoff(t,options)` | `from,to,start,duration,via?` | 插值位置、宽高和圆角，可选二次路径控制点；旧、新内容使用两个错开的透明度窗口。`duration` 用于调整弹簧速度，不代表强制截断运动。 |
| 镜头锚点缩放 | `cameraAnchorZoom(t,options)` | `anchor,screen,fromScale,toScale,fromTranslation,start,duration` | 返回缩放、平移及 `matrix(...)`。变换应以原点为基准；终态把世界坐标 `anchor` 放到屏幕坐标 `screen`。 |
| 拍点网格 | `beatGrid(options)` / `beatAt(t,options)` / `seededNoise(seed,index)` | `bpm,beatsPerBar,start,count,decay`、显式整数种子 | 网格返回拍点时间、小节与强拍；采样返回拍序、拍内相位与指数衰减脉冲。固定种子随机量适用于可重复的幅度变化，不会维护全局随机状态。 |

## 接入示例

```js
const M = window.MotionCore;
const events = [{ at: 0.6, value: 180 }, { at: 2.0, value: 284 }];

function seek(t) {
  const shape = M.liquidStretch(t, events, { initial: 76, width: 82 });
  indicator.style.left = shape.left + 'px';
  indicator.style.width = shape.width + 'px';
  // 其它样式也在同一个 seek(t) 内计算。不要靠 CSS transition 补帧。
}
```

事件里的 `value` 是绝对目标，`at` 是全局时间。`springTrack` 在内部将绝对目标换成增量，不能先在外面重复计算增量。`spring` 开始前返回 `from`；从开始时刻起遵守传入的初速度。传入冻结的参数对象也应正常工作。

## 可视实验室

打开 `assets/motion-lab/index.html`，或从 Skill 的静态服务器访问对应路径。界面包含 12 个真实状态变化的原创 UI 小示范，以及函数名、参数和机制说明。页面播放只使用 `requestAnimationFrame`；各帧内容依然完全由 `seek(t)` 计算。

确定性截图方式：

1. 打开 `assets/motion-lab/index.html?render=1`，页面不自动播放。
2. 等待 `window.ready()` 返回 `true`，确认系统字体已经就绪。
3. 调用 `window.seek(2.25)`。可以重复或倒序调用。
4. 截图对应 SVG 或整个画廊；需要复核时再次调用同一时间。

可选 `?t=2.25&render=1` 直接初始化到指定时间。实验室统一采用 6 秒示范循环；核心函数本身不强制循环。`window.MotionLab.mechanisms` 提供 12 项示范的名称、函数和参数索引。

## 复刻时的边界

原语负责动作计算；镜头选择、时序、字体、图形、布局、配乐与参考视频的视觉分析仍需按案例处理。六叶光圈、贝塞尔光标、纯色漫灌等都是可编辑的原创起点，不能据此宣称原案例的细节已匹配。把真实操作录屏、原案例参考视频、原创示范与复刻输出分别标注。

数值验证覆盖弹簧初值/速度、临界与过阻尼收敛、多目标连续性、冻结输入、重复/倒序采样、拖拽释放、圆形覆盖、6 片叶片、交接终态、镜头锚点、拍点网格与固定种子重复性。数值通过不等同于成片审美验收。
