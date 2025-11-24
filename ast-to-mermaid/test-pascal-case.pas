program TestCase;
var
  x: integer;
begin
  case x of
    1: writeln('One');
    2: writeln('Two');
    else writeln('Other number');
  end;
end.