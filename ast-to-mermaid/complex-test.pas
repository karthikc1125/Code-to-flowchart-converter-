program ComplexTest;
var
  a, b: integer;
begin
  a := 10;
  b := 20;
  
  // Complex nested conditions
  if a > 5 then
  begin
    writeln('a is greater than 5');
    if b < 25 then
    begin
      writeln('b is less than 25');
      if a + b > 30 then
        writeln('Sum is greater than 30')
      else
        writeln('Sum is not greater than 30');
    end;
  end
  else
  begin
    writeln('a is not greater than 5');
    case b of
      10: writeln('b is 10');
      20: writeln('b is 20');
      else writeln('b is something else');
    end;
  end;
  
  // Loop with condition
  while a > 0 do
  begin
    writeln('a is ', a);
    a := a - 1;
  end;
end.