#include <string>
#include <iostream>
int addTwoNumbers(int num1, int num2){
  return num1 + num2;
}
int main(){
  int myInt1;
  int myInt2;
  std::cout << "Enter a number:";
  std::cin >> myInt1;
  std::cout << "Enter a number:";
  std::cin >> myInt2;
  int result = addTwoNumbers(myInt1, myInt2);
  std::cout << "Your Result: ";
  std::cout << result;
  return 0;
}
