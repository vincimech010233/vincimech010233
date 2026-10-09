#include <cmath>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <stdexcept>
#include <string>
#include <vector>
int main(int argc,char** argv){
 try { if(argc!=5) throw std::runtime_error("usage: heat_sim GRID_POINTS STEPS R OUTPUT.csv");
  int n=std::stoi(argv[1]), steps=std::stoi(argv[2]); double r=std::stod(argv[3]);
  if(n<3||steps<1||!std::isfinite(r)||r<=0||r>0.5) throw std::runtime_error("require grid>=3, steps>=1, and 0<r<=0.5");
  std::vector<double> u(n,20.0), next(n); u.front()=100; u.back()=0;
  std::ofstream out(argv[4]); if(!out) throw std::runtime_error("cannot open output file");
  out<<"step,position,temperature_c\n";
  auto write=[&](int step){for(int i=0;i<n;++i) out<<step<<','<<static_cast<double>(i)/(n-1)<<','<<u[i]<<'\n';}; write(0);
  for(int t=1;t<=steps;++t){next.front()=100; next.back()=0; for(int i=1;i<n-1;++i) next[i]=u[i]+r*(u[i-1]-2*u[i]+u[i+1]); u.swap(next); if(t%std::max(1,steps/10)==0||t==steps) write(t);}
  std::cout<<"Wrote temperature profiles to "<<argv[4]<<"\n"; return 0;
 } catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 2;}
}
