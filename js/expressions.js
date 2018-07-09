
var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
    

net.ntxt.expressions.context = (function context()
{
  var API = {
      fromJsonStruct : fromJsonStruct,
      addOp          : addOp,
	  hasOp          : hasOp,
      addVar         : addVar,
	  typeOfExp	     : typeOfExp,
      addRenderers   : addRenderers,
      addRenderer    : addRenderer,
      evaluate       : evaluate,
      render         : render,
	  search		 : search,
      operators      : operators
    },
	_ = {
		assertThat					: assertThat,
		areTwoOrMoreBoolean 	    : areTwoOrMoreBoolean,
		areTwoOfSameType		    : areTwoOfSameType,
		areThreeOfSameType	        : areThreeOfSameType

	},
    self = this,
    _operators = {},
	_doDebug = false,
    renderTargets = {},
    types = {
      'boolean':true,
      'string' :true,
      'number' :true,
      'date'   :true
    };

    function err(msg){
    	if(console && console.log) console.log('ERROR: ' + msg);
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

    function addOp(name, type, label, evaluateFun){
        _operators[name] = {
            type:type,
            label:label,
            evaluate:evaluateFun,
            renderers:{}
        };
        return API;
    };


    function addVar(name, type, valueOrFun){
        variables[name] = {type:type, value:valueOrFun};
        return API;
    };

    function hasOp(op){
    	return _operators.hasOwnProperty(op);
    }

    function addRenderer(op, target, renderFun){
        if(!hasOp(op))
            throw "Cannot add renderer to an unrecognized operator: " + op;
        renderTargets[target] = true;
        _operators[op].renderers[target] = renderFun;
    }

    function addRenderers(provider){
        for(var op in _operators){
            try{
                addRenderer(op, provider.target, provider.getRenderer(op));
            }catch(e){
                err("error adding renderer for " + op + "\n" + e);
            }
        }
    }

    function evaluate(expr, input){
        var op = expr.op || err("missing operator in expr:" + expr),
            def  = _operators[op] || err("unknown operator: " + op),
            args = expr.args || [],
			result = def.evaluate.apply(input, args);

		expr.result = result;
        return result;
    };

    function render(expr, target, input){
        var op = expr.op,
            renderFun = getRenderer(op, target) || err("Missing renderer for: " + op + "  and target: " + target),
            view = renderFun.call(API, expr, input);
        return view;
    };

    function search(expr, operator){
        var found = [];
		recursive(expr);

		function recursive(expr){
			if(expr.op === operator) found.push(expr);
			if(expr.args){
				for(var i = 0; i < expr.args.length; i++){
					recursive(expr.args[i]);
				}
			}
		}

        return found;
    };

    function getRenderer(op, target){
        if(!hasOp(op))
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
            src,
            op;
        if(arguments.length > 0 && typeof arguments[0] === "string"){
            op = arguments[0];
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
                l = a.length,
                val;
            if(l !== 1) err("one argument (property name or function) required");

            if(typeof a[0] === "function"){
                val = a[0].call(this);
            }else if(typeof a[0] === "string"){
				if( !this.hasOwnProperty(a[0]) ){
					err("context does not have property " + a[0]);
				}else if( typeof this[a[0]] === 'undefined') {
					err("context property " + a[0] + " is undefined");
                } else {
					val = this[a[0]];
				}
            }else{
                err("unrecognized type " + (typeof a[0]) + " of property " + a[0] + " in this context");
            }
            if(typeof val === type){
				return val;
			}else{
				err(val + " is of type " + typeof val + " where '" + type + "' expected");
			}
        };
    };

    function genericLiteralEvaluator(type){return function e(){
        var a = arguments,
            l = a.length;
        if(l !== 1) err("one argument (value) required");
        return a[0];
    };};

    function typeOfExp(exp){
    	if(typeof exp.op !== "string") err("Missing expression type (operator).");
    	if(!Array.isArray(exp.args)) err("Missing expression arguments");
    	if(!hasOp(exp.op)) err("Unknown operator: " + exp.op + "; currently known: " + getOpNames().join(', '));
    	return _operators[exp.op].type;
    }

    function assertThat(args, validatorFn){
    	var error = validatorFn.call(this, args);
    	error ? err( error ) : "OK";
    	return args;
    };

    function areTwoOfSameType(args){
    	if(args.length !== 2) return "Operator expects exactly 2 arguments, got: " + args.length;
    	var t1 = typeOfExp(args[0]);
    	var t2 = typeOfExp(args[1]);
    	if(t1 !== t2) return "Argument types have to match, got: " + t1 + "/" + t2;
    	return "";
    }

    function areThreeOfSameType(args){
    	if(args.length !== 3) return "Operator expects exactly 3 arguments, got: " + args.length;
    	var t1 = typeOfExp(args[0]);
    	var t2 = typeOfExp(args[1]);
    	var t3 = typeOfExp(args[2]);
    	if(t1 !== t2 || t2 !== t3) return "Argument types have to match, got: " + t1 + "/" + t2 + "/" + t3;
    	return "";
    }

    function areTwoOrMoreBoolean(args){
    	if(args.length < 2) return "Operator expects at least 2 arguments, got: " + args.length;
    	for(var i=0; i<args.length; i++){
    		var t = typeOfExp(args[i]);
    		if(t !== 'boolean') err("Argument " + i + " is of type " + t + "; boolean expected");
    	}
    	return "";
    }
    // ============= OPERATORS ===============

    addOp('VAR-STRING',   'string',   '#', genericVarEvaluator('string'));
    addOp('VAR-NUMBER',   'number',   '#', genericVarEvaluator('number'));
    addOp('VAR-BOOLEAN',  'boolean',  '#', genericVarEvaluator('boolean'));
    addOp('VAR-DATE',     'date',     '#', genericVarEvaluator('date'));
    addOp('VAL-STRING',   'string',   '',  genericLiteralEvaluator('string'));
    addOp('VAL-NUMBER',   'number',   '',  genericLiteralEvaluator('number'));

    addOp('AND', 'boolean', 'and',
        function e(){
            var a = _.assertThat(arguments, _.areTwoOrMoreBoolean);
            for(var i=0; i < a.length; i++){
                if(API.evaluate(a[i], this) !== true) return false;
            }
            return true;
        }
    );

    addOp('OR', 'boolean', 'or',
        function e(){
            var a = _.assertThat(arguments, _.areTwoOrMoreBoolean);
            for(var i=0; i < a.length; i++){
                if(API.evaluate(a[i], this) === true) return debug = true;
            }
            return debug = false;
        }
    );

    addOp('EQUAL', 'boolean', '=',
        function e(){
	        var a = _.assertThat(arguments, _.areTwoOfSameType);
	        return API.evaluate(a[0], this) === API.evaluate(a[1]);
        }
    );

    addOp('NOT-EQUAL', 'boolean', '<>',
        function e(){
            var a = _.assertThat(arguments, _.areTwoOfSameType);
            return API.evaluate(a[0], this) !== API.evaluate(a[1]);
        }
    );

    addOp('GREATER', 'boolean', '>',
        function e(){
            var a = _.assertThat(arguments, _.areTwoOfSameType);
            return API.evaluate(a[0], this) > API.evaluate(a[1]);
        }
    );

    addOp('LESS', 'boolean', '<',
        function e(){
            var a = _.assertThat(arguments, _.areTwoOfSameType);
            return API.evaluate(a[0], this) < API.evaluate(a[1]);
        }
    );

    addOp('BETWEEN', 'boolean', 'between',
        function e(){
            var a = _.assertThat(arguments, _.areThreeOfSameType);
            return API.evaluate(a[0], this) <= API.evaluate(a[1]) && API.evaluate(a[1]) <= API.evaluate(a[2]);
        }
    );
    return API;
});

Array.isArray||(Array.isArray=function(a){return''+a!==a&&{}.toString.call(a)=='[object Array]'});
