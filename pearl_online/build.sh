#!/bin/bash
build_target=$1

if [ "$build_target" = "fusion" ]; then 
    bazelisk  build --jobs=1  fusion 
elif [ "$build_target" = "packer" ]; then 
    desc_directory="/code/fusion/"
    shell_directory="script/start.sh"
    data_directory="script/offline_data.csv"
    conf_directory="server_config"
    bin_directory="bazel-bin/fusion"
    mkdir -p "$desc_directory"
    chmod -R 755 "$desc_directory"
    chmod  755 "$desc_directory"  
    rm -rf "/code/fusion/fusion"
    cp -r "$bin_directory" "$desc_directory"
    cp -r "$data_directory" "$desc_directory"
    cp -r "$shell_directory" "$desc_directory"
    cp -r "$conf_directory" "$desc_directory"
    echo "copy is ok"
elif [ "$build_target" = "start" ]; then 
    cd  /code/fusion/ && nohup sh  start.sh & 
    echo "start is ok"
fi