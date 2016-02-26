var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.renderers = net.ntxt.expressions.renderers || {};
net.ntxt.expressions.renderers.html = (function html()
{
    var TARGET = 'html',
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
    renderers = {
      'VAR-STRING'   : genericVarRenderer,
      'VAR-NUMBER'   : genericVarRenderer,
      'VAR-BOOLEAN'  : genericVarRenderer,
      'VAR-DATE'     : genericVarRenderer,
      'VAL-STRING'   : genericLiteralRenderer,
      'VAL-NUMBER'   : genericLiteralRenderer,    
      'AND'          : genericListRenderer,
      'EQUAL'        : genericBinaryOpRenderer,
      'GREATER'      : genericBinaryOpRenderer,    
      'LESS'         : genericBinaryOpRenderer        
    };
    
  function genericVarRenderer(ex){
        var op = ex.op,
            varName = ex.args[0],
            view = templates.variable.clone()
                .addClass('op-'+op)
                .text(varName);
        return view;
    };
    
    function genericLiteralRenderer(ex, target){
        var op = ex.op,
            varName = ex.args[0],
            view = templates.literal.clone()
                .addClass('op-'+op)
                .text(varName);
        return view;
    };
    
    function genericListRenderer(ex, target){
        var self = this,
            op = ex.op,
            view = templates.listExpression.clone(),
            header = templates.operator.clone(),
            list = templates.list.clone();
                
        view.addClass('op-'+op)
            .append(header)
                .append(list);
        
        header.text(self.operators(op).label);
        $.each(ex.args, function(i, arg){
            var argView = templates.listElement.clone().append(self.render(arg, target));
            list.append(argView);                                             
        });
        return view;
  };
    
    function genericBinaryOpRenderer(ex, target){
        var self = this,
            op = ex.op,
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
        opView.text(self.operators(op).label);
        arg1View.append(self.render(arg1, target));
        arg2View.append(self.render(arg2, target));

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