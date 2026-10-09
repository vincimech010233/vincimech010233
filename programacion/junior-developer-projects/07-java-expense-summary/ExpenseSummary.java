import java.io.*;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.*;

public class ExpenseSummary {
  public static void main(String[] args) throws IOException {
    if(args.length<1||args.length>2){System.err.println("Usage: java ExpenseSummary FILE.csv [category]");System.exit(2);}
    Map<String,BigDecimal> totals=new TreeMap<>(); int lineNo=0;
    for(String line:Files.readAllLines(Path.of(args[0]))){lineNo++; if(lineNo==1&&line.startsWith("date,"))continue; if(line.isBlank())continue;
      String[] p=line.split(",",-1); if(p.length!=3) throw new IllegalArgumentException("Invalid CSV row "+lineNo);
      String category=p[1].trim(); BigDecimal amount; try{amount=new BigDecimal(p[2].trim());}catch(NumberFormatException e){throw new IllegalArgumentException("Invalid amount on row "+lineNo);}
      if(category.isEmpty()||amount.signum()<0)throw new IllegalArgumentException("Invalid category or negative amount on row "+lineNo);
      if(args.length==1||category.equalsIgnoreCase(args[1]))totals.merge(category,amount,BigDecimal::add);
    }
    if(totals.isEmpty()){System.out.println("No matching expenses.");return;}
    totals.forEach((k,v)->System.out.printf(Locale.ROOT,"%-16s %s%n",k,v.setScale(2,java.math.RoundingMode.HALF_UP)));
  }
}
