program TestCase;
var
  choice: integer;
begin
  // Simple case statement
  case choice of
    1: writeln('One');
    2: writeln('Two');
    3: writeln('Three');
    else writeln('Other number');
  end;
  
  // Case with ranges (if supported)
  case choice of
    1..5: writeln('Between 1 and 5');
    6..10: writeln('Between 6 and 10');
    else writeln('Outside range');
  end;
end.