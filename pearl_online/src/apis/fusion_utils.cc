
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <map>
namespace pearl {

std::map<std::string, std::string> SplitString(const std::string& input, char delimiter1, char delimiter2) {
    std::map<std::string, std::string> keyValuePairs;
    std::istringstream iss(input);
    std::string pair;

    while (std::getline(iss, pair, delimiter1)) {
        std::istringstream pairStream(pair);
        std::string key, value;
        bool first = true;

        while (std::getline(pairStream, pair, delimiter2)) {
            if (first) {
                key = pair;
                first = false;
            } else {
                value = pair;
            }
        }

        // URL decode the value
        std::ostringstream decodedValue;
        for (size_t i = 0; i < value.size(); ++i) {
            if (value[i] == '%' && i + 2 < value.size()) {
                int hexValue;
                std::istringstream hexStream(value.substr(i + 1, 2));
                hexStream >> std::hex >> hexValue;
                decodedValue << static_cast<char>(hexValue);
                i += 2;
            } else {
                decodedValue << value[i];
            }
        }

        keyValuePairs[key] = decodedValue.str();
    }

    return keyValuePairs;
}
}
