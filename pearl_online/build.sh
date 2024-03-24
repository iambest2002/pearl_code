#!/bin/bash
build_target=$1

if [ "$build_target" = "fusion" ]; then 
    bazelisk build fusion 
elif [ "$build_target" = "packer" ]; then 
    desc_directory="/code/fusion/"
    shell_directory="script/start.sh"
    bin_directory="bazel-bin/fusion"
    mkdir -p "$desc_directory"
    chmod -R 755 "$desc_directory"
    cp -r "$bin_directory" "$desc_directory"
    cp -r "$shell_directory" "$desc_directory"
    echo "copy is ok"
fi