
var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.context = (function context()
{
  var contextAPI = {
		fromJsonStruct : fromJsonStruct,
		context        : context,
		addOp          : addOp,
		addVar         : addVar,
  	addRenderers   : addRenderers,
  	addRenderer    : addRenderer,
		evaluate       : evaluate,
		render         : render,
		operators      : operators
	},
	self = this,
	_context = {},
	_operators = {},
	renderTargets = {},
	types = {
		'boolean':true,
		'string' :true,
		'number' :true,
		'date'   :true
	};
	
	function err(msg){
		throw msg;
	};
	
	function operators(){
		if(arguments.length === 1){
			var opName = arguments[0];
			return _operators[opName];
		}else{
			return _operators;
		}
	};
	
	/** the context object to evaluate variables against */
	function context(){
		if(arguments.length > 0){
		  _context = arguments[0];
			return contextAPI;
		}else{
		  return _context;
		}
	};
	
	function addOp(name, type, label, evaluateFun){
		_operators[name] = {
			type:type,
			label:label,
			evaluate:evaluateFun,
			renderers:{}
		};
		return contextAPI;
	};
	
	function addVar(name, type, valueOrFun){
		variables[name] = {type:type, value:valueOrFun};
		return contextAPI;
	};
	
	function addRenderer(op, target, renderFun){
		if(!_operators.hasOwnProperty(op))
			throw "Cannot add renderer to an unrecognized operator: " + op;
		renderTargets[target] = true;
		_operators[op].renderers[target] = renderFun;
	}
	
	function addRenderers(provider){
		for(var op in _operators){
			try{
  			addRenderer(op, provider.target, provider.getRenderer(op)); 
			}catch(e){
				throw "error adding renderer for " + op + "\n" + e;
			}
		}
	}	
	
	function evaluate(expr){
		var op   = expr.op || err("missing operator in expr:" + expr),
				def  = _operators[op] || err("unknown operator: " + op),
        args = expr.args || [];
				
    return def.evaluate.apply(self, args);
	};
	
	function render(expr, target){
		var op = expr.op,
		    renderFun = getRenderer(op, target),
				view = renderFun.call(contextAPI, expr, target);
		return view;
	};
	
	function getRenderer(op, target){
		if(!_operators.hasOwnProperty(op))
			throw "Missing definition of operator: " + op + "; known ones: " + getOpNames().join(', ');
		if(!_operators[op].renderers.hasOwnProperty(target))
			throw "Missing renderer for operator: " + op + " and target: " + target + "; available ones: " + getTargets(op).join(', ');
		return _operators[op].renderers[target];
	}
	
	function getOpNames(){
		var names = [];
		for(var op in _operators){ names.push(op); }
		return names;
	}
	
	function getTargets(){
		var targets = [],
		    src;
		if(arguments.length > 0 && typeof arguments[0] === "string"){
			var op = arguments[0]
			src = _operators[op].renderers;    
		}else{
			src = renderTargets;
		}
		for(var t in src){ targets.push(t); }
		return targets;
	}
	
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
			  val = a[0].call(_context);
      else if(typeof a[0] === "string" && _context.hasOwnProperty(a[0])) 
				val = _context[a[0]];
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
	
	
	// ============= OPERATORS ===============
	
	addOp('VAR-STRING', 'string', '#', genericVarEvaluator('string'));
	addOp('VAR-NUMBER', 'number', '#', genericVarEvaluator('number'));	
	addOp('VAR-BOOLEAN', 'boolean', '#', genericVarEvaluator('boolean'));	
	addOp('VAR-DATE', 'date', '#', genericVarEvaluator('date'));		
	addOp('VAL-STRING', 'string', '', genericLiteralEvaluator('string'));
	addOp('VAL-NUMBER', 'number', '', genericLiteralEvaluator('number'));

				
	addOp('AND', 'boolean', 'and', 
		function e(){
			var a = arguments,
			    l = a.length;
			if(l < 2) err("at least two arguments required, got: " + l);
			for(var i=0; i<l; i++){
				if(evaluate(a[i]) !== true) return false;
			}
			return true;
		}
  );

	addOp('EQUAL', 'boolean', '=',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required, got: " + l);	
			return evaluate(a[0]) === evaluate(a[1]);
		}
  );

	
	addOp('GREATER', 'boolean', '>',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required, got: " + l);
			return evaluate(a[0]) > evaluate(a[1]);			
		}
  );
	

	addOp('LESS', 'boolean', '<',
		function e(){
			var a = arguments,
			    l = a.length;
			if(l !== 2) err("exactly two arguments required, got: " + l);
			return evaluate(a[0]) < evaluate(a[1]);			
		}
  );	
	
	
  return contextAPI;
});
				
Array.isArray||(Array.isArray=function(a){return''+a!==a&&{}.toString.call(a)=='[object Array]'});