import java.util.*;
import java.io.*;

public class Main
{  
    static class FastReader {

        BufferedReader br;

        StringTokenizer st;
 

        public FastReader()

        {

            br = new BufferedReader(

                new InputStreamReader(System.in));

        }
 

        String next()

        {

            while (st == null || !st.hasMoreElements()) {

                try {

                    st = new StringTokenizer(br.readLine());

                }

                catch (IOException e) {

                    e.printStackTrace();

                }

            }

            return st.nextToken();

        }
 

        int nextInt() { return Integer.parseInt(next()); }
 

        long nextLong() { return Long.parseLong(next()); }
 

        double nextDouble()

        {

            return Double.parseDouble(next());

        }
 

        String nextLine()

        {

            String str = "";

            try {

                str = br.readLine();

            }

            catch (IOException e) {

                e.printStackTrace();

            }

            return str;

        }

    }
 
  
    public static void main(String[] args)
    {
      FastReader s=new FastReader();
      StringBuilder sb = new StringBuilder();

      int test=s.nextInt();
        while(test-->0)
       {  
         solve(s,sb);
        
       }
       System.out.println(sb);
      
  }
  public static void solve(FastReader s, StringBuilder sb)
  {
      long a = s.nextInt();
      long b = s.nextInt();
      long c = s.nextInt();
      long d = s.nextInt();
      
      long minh = Math.min(a,b);
      long maxh =Math.max(a,b);

      long minf = Math.min(c-a,d-b);
      long maxf = Math.max(c-a,d-b);

      if(maxh > 2*(minh+1) || maxf > 2*(minf+1)){
        sb.append("NO\n");
      }
      else{
        sb.append("YES\n");
      }
  }
  private static long  gcd(long a, long b){
     if(b==0) return a;
     else return gcd(b,a%b);     
  }
}

     