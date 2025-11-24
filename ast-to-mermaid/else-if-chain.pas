program ElseIfChain;
var
  x: integer;
begin
  if x < 0 then
    writeln('Negative')
  else if x = 0 then
    writeln('Zero')
  else
    writeln('Positive');
end.