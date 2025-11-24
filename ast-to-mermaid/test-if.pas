program TestIf;
var
  x: integer;
begin
  // Simple if statement
  if x > 0 then
    writeln('Positive');
    
  // If-else statement
  if x < 0 then
    writeln('Negative')
  else
    writeln('Zero or positive');
    
  // Nested if statement
  if x > 0 then
  begin
    if x > 10 then
      writeln('Greater than 10')
    else
      writeln('Positive but not greater than 10');
  end;
end.