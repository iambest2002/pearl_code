# Introduction
This is git link about pearl project.


## 理解 bazel 编译的原理

1. 为什么你没有使用 glog， 还可以用 log(error)
2. 你的依赖库和别人的依赖库的关系。  别人依赖了， 你是不是就不用依赖了。 

# workflow 

## install brpc 

1.  install gcc and brpc libary.
sudo yum install -y git g++ make openssl-devel gflags-devel protobuf-devel protobuf-compiler leveldb-devel

2. start gcc 7
sudo yum remove devtoolset-7 &&  sudo yum install centos-release-scl && sudo yum install devtoolset-7 && scl enable devtoolset-7 bash

3. clone code
git clone https://github.com/paolo626/pearl_code.git

4.  install bazelisk
sudo yum install -y nodejs  
sudo yum install npm && sudo npm install -g @bazel/bazelisk 

5. build code
cd  C++ project and run : /root/project/pearl_code/pearl_online
bazelisk build pearl 

## 实现基础的brpc网络返回数据  done
1. wirting a script that can use build and deploy
cd /root/project/pearl_code/pearl_online && chmod 755 build.sh
./build.sh  fusion (ps : 如何拉取不下来多尝试几次， 或者可以试下https://tubring.cn/articles/136 ，改地址， 用国内的地址拉取)

2. 部署代码
./build.sh packer  
./build.sh start

2. test it.
http://193.112.111.178/query

##  将 rapjson 导入进来
1. 参照这个文档。 https://github.com/3rdparty/bazel-rules-rapidjson/blob/main/README.md  其实本质就是设置一个 libary 去配置要对外展示的头文件， 还有自己编译的源码规则， 一般这种基础库都不依赖其他的第三方库。 只有像 rpc这种级别框架才需要。 而这些 rpc导入的话需要 workspace 显性声明。 此外需要注意导入了这个库， 你就可以使用其头文件和里面的定义了， 并且可以向上给更上一层使用者传递这种关系， 高级使用者就不用再导入底层第三方库， 此外每次导入的时候， 你自己依赖的东西例如 string都会被编译成源码 so, 各种 so 也就是 cc编译成的源码之间毫无关系， 都是不同的函数等。 你可以通过头文件找到他， 因此头文件在项目中来回导入定义， bazel 会根据最终导入的状况去链接各种库， 形成编译命令。 

## 添加 gflag 读取配置文件
1. 定义 gflag的配置， server config

## 加载配置  done
现在没有找到能用的 hocon 版本， 所以先搞成 json 或者 key vale 的。

## 使用 glog done
1. ref https://github.com/google/glog#bazel , 一般工业界都是用 a 文件保存到云上加载。 
2. 和 brpc 的定义冲突了， 参照https://github.com/apache/brpc/issues/101 加上配置再运行。 

## 添加责任链模式并且跑通流程 done

## 将召回底层功能添加进来  done

## 将在线召回功能添加进来  done
1. 这里感觉还是链表操作会更好一些。 这种内存分配比较复杂。消耗内存。 todo 后面可以改成链表求并集合。
## 将返回的功能添加进来 done

## 弄成rpc + zk 调用recaller版本

## 创建 dockerfile 或者快速启动脚本

## todo
1. 支持动态的更改配置
2. 支持并行的节点配置和初始化操作
3. 加载hoconf配置: 现在没有找到能用的 hocon 版本， 所以先搞成 json 或者 key vale 的。
1. 