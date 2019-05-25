const expect = require("chai").expect;
const Calc = require("../src/index");
const Lexer = Calc.Lexer;
const Parser = Calc.Parser;
const evalAst = Calc.evalAst;

describe("lexer", function() {
  it("1 * 2 + 1", function() {
    const l = new Lexer("1 * 2 + 3");
    let n;
    n = l.next();
    expect(n.Type).to.equal("Number");
    expect(n.Val).to.equal(1);
    n = l.next();
    expect(n.Type).to.equal("*");
    expect(n.Val).to.equal("*");
    n = l.next();
    expect(n.Type).to.equal("Number");
    expect(n.Val).to.equal(2);
    n = l.next();
    expect(n.Type).to.equal("+");
    expect(n.Val).to.equal("+");
    n = l.next();
    expect(n.Type).to.equal("Number");
    expect(n.Val).to.equal(3);
    n = l.next();
    expect(n).to.equal(null);
  });
});

describe("parser", function() {
  it("++ a", function() {
    const l = new Lexer("++ a");
    const parser = new Parser(l);
    const expr = parser.parse();
    expect(JSON.stringify(expr)).to.equal(
      '{"Type":"UnaryExpressionPrefix","Op":{"Type":"++","Val":"++"},"Argument":{"Type":"Ident","Val":"a"}}'
    );
  });

  it("a", function() {
    const l = new Lexer("a");
    const parser = new Parser(l);
    const expr = parser.parse();
    expect(JSON.stringify(expr)).to.equal('{"Type":"Ident","Val":"a"}');
  });

  it("a ++", function() {
    const l = new Lexer("a ++");
    const parser = new Parser(l);
    const expr = parser.parse();
    expect(JSON.stringify(expr)).to.equal(
      '{"Type":"UnaryExpressionPostfix","Op":{"Type":"++","Val":"++"},"Argument":{"Type":"Ident","Val":"a"}}'
    );
  });

  it("a * ( b + c )", function() {
    const l = new Lexer("a * ( b + c )");
    const parser = new Parser(l);
    const expr = parser.parse();
    expect(JSON.stringify(expr)).to.equal(
      '{"Type":"InfixExpression","Op":{"Type":"*","Val":"*"},"Left":{"Type":"Ident","Val":"a"},"Right":{"Type":"InfixExpression","Op":{"Type":"+","Val":"+"},"Left":{"Type":"Ident","Val":"b"},"Right":{"Type":"Ident","Val":"c"}}}'
    );
  });
});

describe("eval", function() {
  it("1 + 2 + 3", function() {
    const l = new Lexer("1 + 2 + 3");
    const parser = new Parser(l);
    const expr = parser.parse();
    const num = evalAst(expr);
    expect(num).to.equal(6);
  });

  it("1 + 2 * 3", function() {
    const l = new Lexer("1 + 2 * 3");
    const parser = new Parser(l);
    const expr = parser.parse();
    const num = evalAst(expr);
    expect(num).to.equal(7);
  });

  it("1 * 2 + 3", function() {
    const l = new Lexer("1 * 2 + 3");
    const parser = new Parser(l);
    const expr = parser.parse();
    const num = evalAst(expr);
    expect(num).to.equal(5);
  });

  it("1 * ( 2 + 3 )", function() {
    const l = new Lexer("1 * ( 2 + 3 )");
    const parser = new Parser(l);
    const expr = parser.parse();
    const num = evalAst(expr);
    expect(num).to.equal(5);
  });

  it("- 3 * ( 2 + 3 )", function() {
    const l = new Lexer("- 3 * ( 2 + 3 )");
    const parser = new Parser(l);
    const expr = parser.parse();
    const num = evalAst(expr);
    expect(num).to.equal(-15);
  });
});
