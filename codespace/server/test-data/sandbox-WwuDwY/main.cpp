#include <bits/stdc++.h>
using namespace std;

int fx(int n){
  int sum=0;
  while(n--){
    sum+=n;
    n--;
  }
  return sum;
}
int main(){
 int t;
 cin >> t; // number of test cases
 while(t--){
  int n;
   cin>>n;
   cout << fx(n);
 }
}
