<p align="center">
<img src="./img/logo.png" alt="Mirror" width="100">
</p>
<h1 align="center">Mirror</h1>

针对移动设备浏览器特性精简播放器模块优化加载性能，项目 Fork 自开源 H5 视频播放器[DPlayer](https://github.com/DIYgod/DPlayer)

## 使用方式

可以通过直接 import 方式导入播放器进行初始化，vue 项目也可以引用封装好的组件

### import 播放器类

播放器提供 umd 形式包因此可以通过 import 引入或是外部引入两种方式进行使用

```javascript
import Mirror from 'mirror';

import '~node_modules/mirror/dist/index.css';

const player = new Mirror(document.getElementById('#app'), {
    live: false,
    autoplay: false,
    controls: true,
    durationFormat: 'remain',
    poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
    src: 'http://vjs.zencdn.net/v/oceans.mp4'
});

player.on('fullscreenchange', (detail) => {
    console.log(detail);
});

player.$on('canplay', (evt) => {
    console.log(evt);
});

player.play();
```

### 引用 vue 组件

可以通过插件形式引入全局注册或是直接引入组件进行局部注册，自定义事件和 native 事件的绑定方式上有些许不同，native 事件需要在前后各加**两个下划线**`__`作为前后缀与自定义事件进行区分。针对需要定制标题的场景，可以通过 slot 形式将标题注入组件，在组件内部已经完成将自定义标题挂在到播放器头部的工作，如果直接使用播放器类这一步就需要自己去实现。

```javascript
import Vue from 'vue
import Mirror from 'mirror/dist/index.vue.js'

Vue.use(Mirror)
```

```javascript
import Mirror from 'mirror/dist/index.vue.js';

export default {
    components: {
        Mirror
    }
};
```

```html
<template>
    <div class="wrapper">
        <div>
            <mirror
                ref="mirror"
                :src="resource[currentIndex]"
                :poster="poster"
                @__canplay__="onCanplay"
                @__seeking__="onSeeking"
                @ready="(detail) => drawLog('ready', detail)"
                @fullscreenchange="(detail) => drawLog('fullscreenchange', detail)"
                @durationchange="(detail) => drawLog('durationchange', detail)"
                @waiting="(detail) => drawLog('waiting', detail)"
                @volumechange="(detail) => drawLog('volumechange', detail)"
                @play="(detail) => drawLog('play', detail)"
                @pause="(detail) => drawLog('pause', detail)"
                @point="(detail) => drawLog('point', detail)"
            >
                <p class="title">国服实力选手</p>
            </mirror>
        </div>
        <div class="menu-list">
            <button class="btn" @click="onSwitcVideo">切换视频</button>
        </div>
        <div ref="log" class="log" />
    </div>
</template>

<script>
    export default {
        data() {
            return {
                player: undefined,
                poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
                resource: [
                    '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4',
                    {
                        quality: [
                            {
                                label: '超清',
                                url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4'
                            },
                            {
                                label: '高清',
                                url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-480p.mp4'
                            },
                            {
                                label: '标清',
                                url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4'
                            }
                        ],
                        defaultQuality: 1
                    }
                ],
                currentIndex: 0
            };
        },
        mounted() {
            const nativeEvents = ['durationchange', 'volumechange'];

            for (let i = 0; i < nativeEvents.length; i++) {
                this.$refs.mirror.player.$on(nativeEvents[i], (evt) => {
                    this.drawLog(nativeEvents[i], ': ', evt);
                });
            }
        },
        methods: {
            onCanplay(evt) {
                console.log('视频缓存完成可以播放: ', evt);
            },
            onSeeking(evt) {
                console.log('视频缓冲中: ', evt);
            },
            drawLog(name, info) {
                const eventsEle = this.$refs.log;

                eventsEle.innerHTML += `<p>Event: ${name} ${info ? `Data: <span>${JSON.stringify(info)}</span>` : ''}</p>`;
                eventsEle.scrollTop = eventsEle.scrollHeight;
            },
            onSwitcVideo() {
                this.src = this.resource[(this.currentIndex = this.currentIndex === 0 ? 1 : 0)];
            }
        }
    };
</script>

<style lang="less" scoped>
    @import '~node_modules/mirror/dist/index.css';

    .wrapper {
        width: 100%;

        svg {
            width: 100px;
            height: 100px;
        }

        .menu-list {
            text-align: left;
        }

        .log {
            margin-top: 30px;
            width: 100%;
            text-align: left;
            height: 600px;
            overflow: scroll;
            font-size: 36px;
        }

        .title {
            font-size: 54px;
            color: #ff0000;
        }
    }
</style>
```

### 参数

|       参数       | 是否必填 | 默认值 |                                                                                            类型                                                                                             |                                                                                                                                                      描述                                                                                                                                                      |
| :--------------: | :------: | :----: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|       src        |    N     |   -    | `string` &#124; `{url: string; type?: string; label?: string; size?: number;}` &#124; ` {quality: {url: string; type?: string; label?: string; size?: number;}[], defaultQuality?: number}` | 视频源信息，url 为视频链接；type 为文件 mime 类型；label 为要显示的视频源名称；size 为对应视频源文件的总尺寸大小，单位字节；defaultQuality 为视频源优先播放的清晰度（比如设置成 720，表示 720P 分辨率），只有当视频源文件中存在多种分辨率时有效，此时如不设置 defaultQuality 则默认使用 quality 的第一个视频源 |
|     autoplay     |    N     | false  |                                                                     `boolean` &#124; `muted` &#124; `play` &#124; `any`                                                                     |                                                                                                                                                  自动播放设置                                                                                                                                                  |
|       loop       |    N     | false  |                                                                                          `boolean`                                                                                          |                                                                                                                                                  循环播放设置                                                                                                                                                  |
|      muted       |    N     |  true  |                                                                                          `boolean`                                                                                          |                                                                                                                                                    禁音设置                                                                                                                                                    |
|     preload      |    N     |  none  |                                                                           `auto` &#124; `metadata` &#124; `none`                                                                            |                                                                                                                                                   预加载设置                                                                                                                                                   |
|      poster      |    N     |   -    |                                                                                          `string`                                                                                           |                                                                                                                                                    视频封面                                                                                                                                                    |
|     controls     |    N     |  true  |                                                                                          `boolean`                                                                                          |                                                                                                                                               是否显示底部控制栏                                                                                                                                               |
|      title       |    N     |   -    |                                                                                          `string`                                                                                           |                                                                                                                                           全屏播放时显示的视频标题栏                                                                                                                                           |
|       head       |    N     |   1    |                                                                                          `number`                                                                                           |                                                                                                                    标题栏显示规则：0（不显示标题栏）；1（只在全屏模式下显示）；2（无限制）                                                                                                                     |
|      mutex       |    N     |  true  |                                                                                          `boolean`                                                                                          |                                                                                                                       排他性，如果设置为 true 当前视频播放会自动暂停页面中其他视频的播放                                                                                                                       |
|     fullType     |    N     | native |                                                                                    `native` &#124; `dom`                                                                                    |                                                                            设置通过调用底层 API 进行全屏还是通过调整 DOM 样式实现全屏，通过底层方式进行全屏取消全屏后页面会回到顶部，这对视频列表不是很友好可以采用 DOM 形式来处理                                                                             |
|       live       |    N     | false  |                                                                                          `boolean`                                                                                          |                                                                                                                                   是否为直播，如果是直播的话不显播放进度条示                                                                                                                                   |
|  durationFormat  |    N     | total  |                                                                                   `remain` &#124; `total`                                                                                   |                                                                                                                                              视频播放时间显示格式                                                                                                                                              |
| floatBarAutoHide |    N     |  true  |                                                                                          `boolean`                                                                                          |                                                                                                                   悬浮组件是否自动隐藏包括底部控制栏以及标题栏，可以通过实例属性进行实时调整                                                                                                                   |

### 静态属性

| 属性名  | 只读 |   类型   |   描述   |
| :-----: | :--: | :------: | :------: |
| version |  Y   | `string` | 当前版本 |

### 实例属性

|      属性名      | 只读 |                                                                                            类型                                                                                             | 描述                              |
| :--------------: | :--: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | --------------------------------- |
|       src        |  N   | `string` &#124; `{url: string; type?: string; label?: string; size?: number;}` &#124; ` {quality: {url: string; type?: string; label?: string; size?: number;}[], defaultQuality?: number}` | 查询/设置视频源                   |
|    videoWidth    |  Y   |                                                                                          `number`                                                                                           | 视频宽度                          |
|   videoHeight    |  Y   |                                                                                          `number`                                                                                           | 视频高度                          |
|   currentTime    |  N   |                                                                                          `number`                                                                                           | 查询/设置当前播放进度时长         |
|     duration     |  Y   |                                                                                          `number`                                                                                           | 视频总时长                        |
|  currentQuality  |  N   |                                                                                          `number`                                                                                           | 查询/设置多视频源当前视频索引位置 |
|      muted       |  N   |                                                                                          `boolean`                                                                                          | 查询/设置禁音状态                 |
|      paused      |  Y   |                                                                                          `boolean`                                                                                          | 查询视频是否处于暂停状态          |
|      volume      |  N   |                                                                                       `number(0 ~ 1)`                                                                                       | 查询/设置音量大小                 |
|    fullscreen    |  Y   |                                                                                          `boolean`                                                                                          | 当前是否全屏                      |
| floatBarAutoHide |  N   |                                                                                          `boolean`                                                                                          | 查询/设置控制栏是否自动隐藏       |

### 实例方法

#### 快捷方法

将几个调用频率比较高的方法直接在播放器实例上进行暴露方便外部进行调用，其他的方法可以通过对应的模块调用

|      方法名       |                参数                 | 返回值 |        描述        |
| :---------------: | :---------------------------------: | :----: | :----------------: |
|       play        |                  -                  |   -    |      播放视频      |
|       pause       |                  -                  |   -    |      暂停播放      |
| requestFullscreen |                  -                  |   -    |      切换全屏      |
|  exitFullscreen   |                  -                  |   -    |      取消全屏      |
|        on         | `name(事件名)`,`callback(回调函数)` |   -    | 绑定自定义事件监听 |
|        $on        | `name(事件名)`,`callback(回调函数)` |   -    |  绑定原生事件监听  |

### 事件

事件分为自定义事件与原生事件，原生事件指的是 video 标签在视频播放的各个生命周期抛出的相关事件，业务方可以监听这些事件做更精细化的操作。自定义事件是基于原生事件以及一些交互操作封装的事件逻辑，一般使用自定义事件就可以满足大多数的业务场景，部分自定义事件和原生事件重名但是返回参数不同。

#### 自定义事件

|     事件名称     |           回调参数            |                     描述                     |
| :--------------: | :---------------------------: | :------------------------------------------: |
|      ready       |         `{index: 0}`          |               播放器初始化完成               |
|      point       |               -               |         通过点击拖拽进度条快进/快退          |
|   volumechange   | `{volume: 0.1, muted: false}` |           禁音/音量大小变化时触发            |
| fullscreenchange |     `{fullscreen: true}`      |              全屏状态切换时触发              |
|  durationchange  |       `{duration: 999}`       |                 视频时长变化                 |
|     waiting      |      `{waiting: false}`       |              视频是否在加载缓冲              |
|       play       |               -               |                 视频开始播放                 |
|      pause       |               -               |                 视频暂停播放                 |
|   sourcechange   |      `{qualityIndex: 1}`      | 切换视频源触发，回调参数是切换到的视频源索引 |
|     destroy      |               -               |               视频组件实例销毁               |

#### 原生事件

原生事件直接透传 video 节点接收到的参数详细信息请自行查阅，支持的事件包括

```javascript
this.nativeEvents = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'ended',
    'error',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'mozaudioavailable',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting'
];
```

## 开发注意事项

1. Node 版本要求 18.x.x
