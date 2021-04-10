#ifndef NEWCXXTEST_H
#define NEWCXXTEST_H

#include "C:/cygwin64/cxxtest/cxxtest/TestSuite.h"
#include "code.h"

class newCxxTest : public CxxTest::TestSuite {
    public:
    void testAddNumbers() {
        int sum = addNumbers(1, 2);
        TS_ASSERT(sum == 3);
    }

};

#endif //NEWCXXTEST_H
