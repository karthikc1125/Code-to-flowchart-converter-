program FullTest;
var
  x, y: integer;
begin
  // Variable declaration
  x := 5;
  y := 10;
  
  // Simple if statement with body execution
  if x > 0 then
    writeln('Positive number');
    
  // If-else statement with body execution
  if y < 5 then
    writeln('Small number')
  else
    writeln('Large number');
    
  // Nested if statement with body execution
  if x > 0 then
  begin
    if y > 5 then
      writeln('Both conditions met')
    else
      writeln('Only first condition met');
  end;
  
  // While loop
  while x > 0 do
  begin
    writeln('Counting down: ', x);
    x := x - 1;
  end;
  
  // For loop
  for x := 1 to 5 do
    writeln('Iteration: ', x);
    
  // Case statement
  case y of
    1: writeln('One');
    2: writeln('Two');
    3: writeln('Three');
    else writeln('Other number');
  end;
end.