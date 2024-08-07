# Introduction
This is git link about pearl project.

# C++ 后端搜索专题  done
实现一个 C++单机版本的搜索引擎， 加载scv底层文件，然后建立索引，然后对外提供查询接口。

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
 搞成 json 或者 key vale 的。
 ### note: 更完善的配置文件 + gflag
 1. 一般线上服务喜欢用 hcon, 因为这个能加载环境变量， 并且能够覆盖老的配置， 一般每个机房有每个机房的配置。通过机房的配置环境变量 + start.sh 脚本去控制。 
 2. 对于一些基础组件， 如果想要控制它，一般都不能直接操作对应的配置， 不给你留复杂的接口或者全局变量。 一般都是 gflag, 你加载起来后， 如果你有配置 gflag数据就用你的， 没有配置就用人家那边默认的。

### note 支持动态的更改配置
 1. 一般对于线上服务， 都有一个配置化的中心， 界面操作配置， 然后代码中通过 http注册到这个注册中心， 然后开启个线程定时检测，当检测到有变化之后， 通过函数对象的 map去查找对应执行功能节点， 去更新配置。  这里一定要注意线程安全性， 改的时候， 如果之前的还在用， 要么用双 buff, 要么用读写锁， 或者用线程安全的数据结构。
 2. 对于线上服务，还有一个 http接口 能够通过 url 控制服务里面的开关， 从而实现单机的实时操作。 

## 使用 glog done
1. ref https://github.com/google/glog#bazel , 一般工业界都是用 a 文件保存到云上加载。 
2. 和 brpc 的定义冲突了， 参照https://github.com/apache/brpc/issues/101 加上配置再运行。 

### note：
3. log要分清楚主要的还是次要的， 做到致命错误一定要告警， 不能刷太多。 glog支持多次日志只刷一次。  另外日志满需要调整级别。 还有对于 error日志要注意比较吃cpu, 因为他是没缓存直接落磁盘的， 注意别打太多。


## 添加责任链模式并且跑通流程 done
1. 这个比较简单， 就不多说了。
## note  
1. 这块其实更好的做法就是 dag, 每个节点自己加载自己的配置， 然后有个总配置和资源， 然后还有个 session, 自己事先编排好任务。运行阶段， 能够一个个的执行， 而且能够并行的节点执行。 这样每次只需要关注自己的节点代码， 还有就是节点在 dag中的任务就行。  
2. 此外节点还可以加不上 dag 里的子节点， 就是搞个函数对象， impl 模式。 而且节点如果是使用场景比较高的话，可以把变化的都抽象成配置。 
3. 对于一些 pass 化的业务， 可以使用插件的方式， 迭代新业务， 这样不用让主业务去强行适配。提升代码质量。

## 将召回底层功能添加进来  done

## note 
1. 召回底层基础架构其实业界主流的做法是用指针求交集， 不是创建数据结构做判断。 此外还有压缩等方式。 

## 将在线召回功能添加进来  done
1. 这里感觉还是链表操作会更好一些。 这种内存分配比较复杂。消耗内存。 todo 后面可以改成链表求并集合。

### note
1.  词的构建不是简单的切割， 一般会比较复杂， 这里其实一般会有个解析词的模块， 这个模块会分词和给出一些重点。 

## 将返回 packer的功能添加进来 done

## 附录:理解 bazel 编译的原理

1. 为什么你没有使用 glog， 还可以用 log(error)
2. 你的依赖库和别人的依赖库的关系。  别人依赖了， 你是不是就不用依赖了。 

##  todo 专题

### 提升性能
1. perf加火焰图排查问题， 看 热点函数和cache miss。
2. asan排查内存泄露等。 

## 提升架构的设计
1. 弄成rpc + zk 调用recaller版本.
2. 用更好的流量控制组件.
2. serverless 等按照资源来进行部署节点 
4. 通用的东西就抽象到一个地方， 不要堆积屎山。
## 提升安全性
1. 自适应降级等功能，遇到问题就不要人手动操作。 
### 提升开发的效率
ci cd ,监控， docker 部署。自测工具。 这块不是自己工作中能接触到的，所以考虑可以跳过。直接参照工业界的实现。 

# 客户端服务专题
## 客户端安装基础的工具
1. clipy 查看最近的历史纪录。
2. alfred 查看历史纪录， 比 clipy更加强大。 
3. alfred  输入一些常见的命令快捷键。解决一些搜不到， 或者历史很少用的纪录。 通过它可以去请求我们的服务端， 然后服务端请求搜索和大模型， 将最相关的结果返回。 todo, 后续可以升级成智能体。

## 客户端编写代码，用来接受服务端的结果并且复制到粘贴板。todo
为什么这样做？ 主要是因为我们很多操作都是在开发机上操作的， 让开发机发送数据给服务端 ，服务端处理完放到一个接口中， 然后客户端每秒定时轮训的查询结果， 结果返回到粘贴板上。（放不放粘贴板其实提升效率不高， 可以后面再做）。


# 在线业务后端专题 pearl_server
要求： 
1. 请求在线接口拿到搜索的结果。
2.  在线接口通过后台执行。
3. 并且提供插入数据的接口。
4. 使用 django 开发。

## 实现一个 django后端 

## 实现一个本地的搜索引擎

## 实现接口插入搜索数据

## 实现小程序操作记录账单

## 实现小程序控制硬件


## 大模型问答处理各种私人问题  （langchain 那套， 自己也可以在工作中搞， 因为工作中有这个应用的需求， 但是其底层的原理可能接触不到，因此这里看实际情况， 是否要调整）
思考：大模型内部是否有千人千面呢？ 应该是有的， 只不过没有你的个人信息， 只有你的最近行为。因此我们看大模型其实都没有复杂的排序等逻辑， 都是简单召回和排序之后， 它基于你之上返回结果。目前的大模型需要一些排序后的结果， 但是比搜索系统返回的精排数量要大， 因此可能就只需要粗排。 然后现在因为没有特别现金流的落地场景， 也不需要混排和汇总。 取而代之的是混合思考，根据返回的结果综合找到最佳的解决方案。因此可以看到不能基于现有的搜索系统进行改造， 可能需要去掉一些模块。 并且中途调用接口的操作也换成模型自己去调用了。
- 但是也有可能是另外一种方式， 把现在精排去掉， 粗排模型增加的复杂一些，流量调控加上去，还有汇总信息整合起来。 然后大模型思考用户的意图然后去请求一些模块然后综合返回。
- 但是对于简单的业务， 不需要粗排， 召回出来就调用一些 tools思考后返回。
- 我们这个场景由于数据非常少， 没有挑选的心智负担， 可能不需要大模型给我回答， 我看一眼就知道是什么了。 也不需要用户行为相关的精准排序， 因为都是自己插入的数据， 数据也非常少。 也不需要混排，数据很少。




## 将推荐系统迁移到搜索引擎中， 实现在线的千人千面搜索（这块可以不用做， 直接梳理工作工业界中的逻辑就行， 自己做出来的，肯定没有公司级别的效果好， 而且拿出来讲也很容易被专业做这方面的人觉得水）
### 在线召回专题
1. 目前市面上的召回是分为物品召回和user召回 也就是向量召回， 还有就是倒排召回。  在召回之后来个简单模型做相关性和粗排。向量召回一般是 faiss ， redis拿到用户特征后做向量召回。 
 我们就搞个es向量召回（替换 faiss， 原理差不多的）和 es 倒排召回吧。  粗排我们的数据量不够， 先不搞。  需要注意推荐和搜索在召回方面侧重点不一样， 搜索重相关性， 不能为了短期效果提升而忽略相关性， 不然容易有体验问题， 但是推荐就很追求发散和指标， 相关性几乎没有， 因为用户也不知道自己想要啥。
### 在线排序和训练专题
搞个简单的模型就行，或者就不搞了。 排序完的结果最后给大模型。 
这里常见的主要流程就是算法把各种表落库聚合， 然后通过大规模分布式训练搞出来一个模型， 线上通过 tensorflow 加载， 可以支持热更新， 然后还会把各种用户和物料的模型特征放入在线的 redis。 一般排序前， 会把用户之前的画像信息拿到， 然后获取对应的特征， 然后塞入模型预测。  得到结果进行重排和流量调控后包装详情返回。

## 基于 django监控， ut等工具的完善（这块也可以不搞， 因为工作中会经常使用的， 在工作中用到的比外面书中或者简单实现的更为详细）

# 离线专题
## 梳理大数据任务相关的工作技术栈
大数据相关的工作都是比较依赖实际工作的， 像pearl这种体量的数据， 其实很难有

## 撰写写入在线的数据操作脚本

## 脚本框架定时处理各种数据和任务（这块其实类似是个 agant， 模型会调用他实现一些内容）

# 指标提升和运营专题
1. 在实际生产中， 对新品等需要进行干预和流量调整。 这块比较专业， 不做这个模块很难知道怎么做， 因此这里就先不列了。
