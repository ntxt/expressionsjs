
var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.context = (function context()
{
  var contextAPI = {
		fromJsonStruct : fromJsonStruct,
		entity         : entity,
		addOp          : addOp,
		addVar         : addVar,
		evaluate       : evaluate,
		render         : render,
		operators      : ops
	},
	self = this,
	_entity = {},
	operators = {},
	templates = {
		operator       : $('<span>').addClass('operator interactive'),
		binaryArgument : $('<span>').addClass('argument interactive'),
		expression     : $('<div>').addClass('expression'),
		listExpression : $('<div>').addClass('list expression'),
		list           : $('<ul>'),
		listElement    : $('<li>'),
		variable       : $('<span>').addClass('variable'),
		literal        : $('<span>').addClass('literal')		
	},
	types = {
		'boolean':true,
		'string' :true,
		'number' :true,
		'date'   :true
	};
	
	function err(msg){
		throw msg;
	};
	
	function ops(){return operators;};
	
	/** the context object to evaluate variables against */
	function entity(){
		if(arguments.length > 0){
		  _entity = arguments[0];
			return contextAPI;
		}else{
		  return _entity;
		}
	};
	
	function addOp(name, type, label, evaluateFun, renderFun){
		operators[name] = {type:type, label:label, evaluate:evaluateFun, render:renderFun};
		return contextAPI;
	};
	
	function addVar(name, type, valueOrFun){
		variables[name] = {type:type, value:valueOrFun};
		return contextAPI;
	};
	
	function evaluate(expr){
		var op   = expr.op || err("missing operator in expr:" + expr),
				def  = operators[op] || err("unknown operator: " + op),
        args = expr.args || [];
				
    return def.evaluate.apply(self, args);
	};
	
	function render(expr){
		var op = expr.op,
		    renderFun = operators[op].render,
				view = renderFun.call(self, expr);
		return view;
	};
	
	function fromJsonStruct(expStruct){
		var maxRecursion = 10,
		    expr = recursive(expStruct, maxRecursion);
		
		function recursive(struct, recursion){
			if(recursion < 0) err("Expression too deep, more than " + maxRecursion + " levels.");
			var expr = {};
			for(var op in struct){
				expr.op = op;
				expr.args = [];
				var args = struct[op];
				if(Array.isArray(args)){
					var i=0, c = args.length;
					for(i;i<c;i++){
						expr.args.push(recursive(args[i], recursion - 1));
					}
				}else{
					expr.args.push(args);
				}
			}			
			return expr;
		}
		
		return expr;
	};
	
	function genericVarEvaluator(type){return function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 1) err("one argument (property name or function) required");
			var val;
			if(typeof a[0] === "function")
			  val = a[0].call(_entity);
      else if(typeof a[0] === "string" && _entity.hasOwnProperty(a[0])) 
				val = _entity[a[0]];
			else
			  err("cannot evaluate " + a[0] + " in this context");
				
			if(typeof val === type) return val;
			else err(val + " is of type " + typeof val + " where '" + type + "' expected");
		};
	};
	
	function genericLiteralEvaluator(type){return function e(){
		var a = arguments,
				l = a.length;
		if(l !== 1) err("one argument (value) required");
		return a[0];		
	};};
	
	function genericVarRenderer(ex){
		var op = ex.op,
				varName = ex.args[0],
				view = templates.variable.clone()
				 .addClass('op-'+op)
				 .text(varName);
		return view;
	};
	
	function genericLiteralRenderer(ex){
		var op = ex.op,
				varName = ex.args[0],
				view = templates.literal.clone()
				 .addClass('op-'+op)
				 .text(varName);
		return view;
	};
	
	function genericListRenderer(ex){
		var op = ex.op,
				view = templates.listExpression.clone(),
				header = templates.operator.clone(),
				list = templates.list.clone();
				
		view.addClass('op-'+op)
		    .append(header)
				.append(list);
		header.text(operators[op].label);
		$.each(ex.args, function(i, arg){
			var argView = templates.listElement.clone().append(render(arg));
			list.append(argView);											 
		});
		return view;
  };
	
	function genericBinaryOpRenderer(ex){
		var op = ex.op,
				view = templates.expression.clone(),
				arg1 = ex.args[0],
				arg2 = ex.args[1],				
				arg1View = templates.binaryArgument.clone(),
				arg2View = templates.binaryArgument.clone(),
				opView = templates.operator.clone();
				
		view.addClass('binary op-'+op)
		    .append(arg1View)
		    .append(opView)
			  .append(arg2View);
		opView.text(operators[op].label);
		arg1View.append(render(arg1));
		arg2View.append(render(arg2));

		return view;	
	};
	// ============= OPERATORS ===============
	
	addOp('VAR-STRING', 'string', '#', genericVarEvaluator('string'), genericVarRenderer);
	addOp('VAR-NUMBER', 'number', '#', genericVarEvaluator('number'), genericVarRenderer);	
	addOp('VAR-BOOLEAN', 'boolean', '#', genericVarEvaluator('boolean'), genericVarRenderer);	
	addOp('VAR-DATE', 'date', '#', genericVarEvaluator('date'), genericVarRenderer);		
	
	addOp('VAL-STRING', 'string', '', genericLiteralEvaluator('string'), genericLiteralRenderer);
	addOp('VAL-NUMBER', 'number', '', genericLiteralEvaluator('number'), genericLiteralRenderer);

				
	addOp('AND', 'boolean', 'and', 
		function e(){
			var a = arguments,
			    l = a.length;
			if(l < 2) err("at least two arguments required");
			for(var i=0; i<l; i++){
				if(evaluate(a[i]) !== true) return false;
			}
			return true;
		},
		genericListRenderer
  );
	
	addOp('EQUAL', 'boolean', '=',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required");	
			return evaluate(a[0]) === evaluate(a[1]);
		},
		genericBinaryOpRenderer
  );

	addOp('GREATER', 'boolean', '>',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required");
			return evaluate(a[0]) > evaluate(a[1]);			
		},
		genericBinaryOpRenderer
  );
	

	addOp('LESS', 'boolean', '<',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required");
			return evaluate(a[0]) < evaluate(a[1]);			
		},
		genericBinaryOpRenderer
  );	
	
  return contextAPI;
});
				
Array.isArray||(Array.isArray=function(a){return''+a!==a&&{}.toString.call(a)=='[object Array]'});