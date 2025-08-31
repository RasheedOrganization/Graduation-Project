import java.util.*;
public class Main {
    static boolean valid(int x, int y) {
        int M=Math.max(x, y);
        int N= Math.min(x, y);
        return M <= 2 * (N+1);
    }
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        int t=sc.nextInt();
        while(t-- >0){
            int a=sc.nextInt();
            int b=sc.nextInt();
            int c=sc.nextInt();
            int d=sc.nextInt();
            boolean ok=valid(a, b) && valid(c-a,d-b);
            System.out.println(ok ? "YES" : "NO");
        }
    }
}