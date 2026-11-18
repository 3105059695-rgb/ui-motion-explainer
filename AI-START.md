# 从 GitHub 仓库地址开始

仓库根目录就是 `ui-motion-fusion`。收到地址和本期任务的 Agent 在当前对话完成接入。已有匹配的安装就复用；已有本期工程先从 [SKILL.md](SKILL.md) 的 `resume` 接续。

新电脑用 Git 获取默认分支，或下载仓库的源码 ZIP 并解压。仓库内有公开参考、字体、动作实现和安装器。有 Python 3.10+ 即可准备镜头，成片工具要求见[安装说明](docs/install.md)。

```sh
git clone --depth 1 https://github.com/3105059695-rgb/ui-motion-explainer.git ui-motion-fusion
cd ui-motion-fusion
python -B -X utf8 install.py --update --brief
```

安装器返回登记路径，也可以在当前仓库直接执行。新片给 Agent 口播及已有素材，按[主入口](SKILL.md)准备工程；下次给同一工程目录即可接续。
