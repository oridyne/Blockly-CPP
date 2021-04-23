/* Copyright 2020
 * File:   %<%NAME%>%.%<%EXTENSION%>%
 * Author: %<%USER%>%
*
 * Created on %<%DATE%>%, %<%TIME%>%
 * 
 * This file uses the CxxTest library <TestSuite> to create test cases 
 * for a students project. For full cxxtest documentation see the userguide
 * located in your C:\MinGW\cxxtest\doc or visit: 
 * http://cxxtest.com/guide.html
 * 
 */
//
// Created by  on 1/26/2021.
//

#ifndef TESTNEW_H 
#define TESTNEW_H 


//Include your classes header file(s) below and uncomment.
#include "C:/cygwin64/cxxtest/cxxtest/TestSuite.h"
#include "Conversion.h"

class newCxxTest : public CxxTest::TestSuite {
public:
    //All tests should start with the word 'test' followed by
    //the name of the function being tested.

    void testBinaryToDecimalPos1() {
        Conversion converter;
        std::bitset<32>bin(22);
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getDecimal(),22);
    }

    void testBinaryToDecimalPos2() {
        Conversion converter;
        std::bitset<32>bin(33);
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getDecimal(),33);
    }

    void testBinaryToDecimalNeg1() {
        Conversion converter;
        std::bitset<32>bin(-22);
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getDecimal(),-22);
    }

    void testBinaryToDecimalNeg2() {
        Conversion converter;
        std::bitset<32>bin(-1);
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getDecimal(),-1);
    }

    void testBinaryToDecimalStr() {
        Conversion converter;
        converter.binaryToDecimal("00000000000000000000000011110110");
        TS_ASSERT_EQUALS(converter.getDecimal(),246);
        TS_ASSERT_EQUALS(converter.getNumBits(),8);
    }

    void testBinaryToDecimalStrNeg() {
        Conversion converter;
        converter.binaryToDecimal("11111111111111111111111100001010");
        TS_ASSERT_EQUALS(converter.getDecimal(),-246);
    }

    void testDecimalToBinaryPos1() {
        Conversion converter;
        int dec = 223;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getBinary(), std::bitset<32>(223));
    }

    void testDecimalToBinaryPos2() {
        Conversion converter;
        int dec = 5422;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getBinary(), std::bitset<32>(5422));
    }

    void testDecimalToBinaryNeg1() {
        Conversion converter;
        int dec = -456;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getBinary(), std::bitset<32>(-456));
    }

    void testDecimalToBinaryNeg2() {
        Conversion converter;
        int dec = -6646;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getBinary(), std::bitset<32>(-6646));
    }
    
    void testNumBitsNeg() {
        Conversion converter;
        std::string bin = "11111111111111111111111100001010";
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getNumBits(),9);
        int dec = -456;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getNumBits(),10);
        dec = -1023;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getNumBits(),11);
        dec = 0;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getNumBits(),0);
        dec = -1;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getNumBits(),2);
    }

    void testNumBitsPos() {
        Conversion converter;
        std::string bin = "00000000000000000000000000010110";
        converter.binaryToDecimal(bin);
        TS_ASSERT_EQUALS(converter.getNumBits(),5);
        int dec = 22;
        converter.decimalToBinary(dec);
        TS_ASSERT_EQUALS(converter.getNumBits(),5);
    }
};

#endif //NEWCXXTEST_H
