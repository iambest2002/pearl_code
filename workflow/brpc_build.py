

import subprocess

def install_git():
    try:
        # Execute the command to install Git using yum package manager
        subprocess.run(["sudo", "yum", "install", "-y", "git"])
        print("Git has been successfully installed.")
    except Exception as e:
        print(f"An error occurred: {e}")

def clone_repository():
    try:
        # Execute the git clone command
        subprocess.run(["git", "clone", "https://github.com/apache/brpc.git"])
        install_brpc_dependity = "sudo yum install -y git g++ make openssl-devel gflags-devel protobuf-devel protobuf-compiler leveldb-devel"
        
        # Execute the command
        subprocess.run(install_brpc_dependity, shell=True, check=True)
        
        intall_gcc = "sudo yum remove devtoolset-7 &&  sudo yum install centos-release-scl && sudo yum install devtoolset-7 && scl enable devtoolset-7 bash "

        subprocess.run(intall_gcc, shell=True, check=True)


        print("Repository cloned successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")



if __name__ == "__main__":
    install_git()
    clone_repository()

###
# sudo yum install -y nodejs  && sudo yum install npm && sudo npm install -g @bazel/bazelisk  && bazelisk build pearl && 移动两个ssl到bin执行的目录中 
# http://43.129.178.127:80 to see api.
###