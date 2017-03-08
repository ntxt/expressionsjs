var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.renderers = net.ntxt.expressions.renderers || {};
net.ntxt.expressions.renderers.english = (function english()
{
    var TARGET = 'english',
        renderers = {
      'VAR-STRING'   : genericVarRenderer,
      'VAR-NUMBER'   : genericVarRenderer,
      'VAR-BOOLEAN'  : genericVarRenderer,
      'VAR-DATE'     : genericVarRenderer,
      'VAL-STRING'   : genericLiteralRenderer,
      'VAL-NUMBER'   : genericLiteralRenderer,    
	  'AND'          : listAndRenderer,
      'OR'           : listOrRenderer,
      'EQUAL'        : genericComparisonRenderer('is'),    
      'GREATER'      : genericComparisonRenderer('is greater than'),    
      'LESS'         : genericComparisonRenderer('is less than')      
    };
    
  function genericVarRenderer(ex){
        var op = ex.op,
                varName = ex.args[0],
                view = varName;
        return view;
    };
    
    function genericLiteralRenderer(ex){
        var self = this,
            op = ex.op,
                varName = ex.args[0],
                view = (self.operators(op).type === 'number') ? varName : "'" + varName + "'";
        return view;
    };
    
    function listAndRenderer(ex){
        var self = this,
            op = ex.op,
                view = "( ";
                
        $.each(ex.args, function(i, arg){
            var argView = self.render(arg, TARGET);
			if(i == ex.args.length - 1){
			    view += " and ";
			}else if(i > 0) {
				view += ", ";
			}
            view += argView;                                             
        });
        view += " )";
        return view;
    };
	
    function listOrRenderer(ex){
        var self = this,
            op = ex.op,
                view = "( ";
                
        $.each(ex.args, function(i, arg){
            var argView = self.render(arg, TARGET);
			if(i > 0) {
				view += " or ";
			}
            view += argView;                                             
        });
        view += " )";
        return view;
    };	

    function genericComparisonRenderer(opLabel){return function comparisonRenderer(ex){
        var self = this,
            op = ex.op,
                view = "",
                arg1 = ex.args[0],
                arg2 = ex.args[1];
                
        view = self.render(arg1, TARGET) + " " + opLabel + " " + self.render(arg2, TARGET);
        return view;    
    };};
    
    function genericBinaryOpRenderer(ex){
        var self = this,
            op = ex.op,
                view = "",
                arg1 = ex.args[0],
                arg2 = ex.args[1];
                
        view = self.render(arg1, TARGET) + " " + self.operators(op).label + " " + self.render(arg2, TARGET);
        return view;    
    };
    
    function getRenderer(opName){
        return renderers[opName];
    }
    
    return {
        getRenderer:getRenderer,
        target:TARGET
    };
});