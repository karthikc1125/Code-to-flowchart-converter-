program ConditionalDemo;
var
  x, y: integer;
begin
  // Test all conditional statement types
  
  // 1. Simple if statement
  if x > 0 then
    writeln('Positive number');
    
  // 2. If-else statement
  if y < 10 then
    writeln('Small number')
  else
    writeln('Large number');
    
  // 3. Nested if statement
  if x > 0 then
  begin
    if y > 0 then
      writeln('Both positive')
    else
      writeln('Only x is positive');
  end;
  
  // 4. Else-if chain
  if x < 0 then
    writeln('Negative')
  else if x = 0 then
    writeln('Zero')
  else
    writeln('Positive');
    
  // 5. Case statement
  case x of
    1: writeln('One');
    2: writeln('Two');
    3: writeln('Three');
    else writeln('Other number');
  end;
  
  // 6. Case with ranges
  case y of
    1..10: writeln('Small range');
    11..20: writeln('Medium range');
    else writeln('Large number');
  end;
end.