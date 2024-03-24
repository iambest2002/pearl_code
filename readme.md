# Introduction
This is git link about pearl project.


# workflow 

## install brpc 

1.  install gcc and brpc libary.
sudo yum install -y git g++ make openssl-devel gflags-devel protobuf-devel protobuf-compiler leveldb-devel

2. start gcc 7
sudo yum remove devtoolset-7 &&  sudo yum install centos-release-scl && sudo yum install devtoolset-7 && scl enable devtoolset-7 bash

3. clone code
git clone https://github.com/paolo626/pearl_code.git

4.  install bazelisk
sudo yum install -y nodejs  && sudo yum install npm && sudo npm install -g @bazel/bazelisk 

5. build code
cd  C++ project and run
bazelisk build pearl 

## 实现基础的brpc网络返回数据
1. wirting a script that can use build and deploy

2. test it.
http://119.28.32.17/query


