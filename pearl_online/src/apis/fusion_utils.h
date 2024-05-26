
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <map>
namespace pearl {

std::map<std::string, std::string> SplitString(const std::string& input, char delimiter1, char delimiter2);
}
