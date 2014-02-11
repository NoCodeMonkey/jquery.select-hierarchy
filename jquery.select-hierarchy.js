/**
 * @author Ryan Leeder <ryanleeder@gmail.com>
 * @version 1.0.0
 * 
 * Hack to remove spaces from selected option borrowed from
 * http://stackoverflow.com/questions/10885866/jquery-remove-spaces-from-selected-state-in-option-dropdown-on-change-event
 */

(function($, document, window, undefined) {
	"use strict";

	function SelectHierarchy(element, options) {
        this.element = element;
		this.options = $.extend({}, $.fn.selectHierarchy.defaults, options);
	}
	
	SelectHierarchy.prototype = {
		constructor : SelectHierarchy,
		init: function() {
			var that = this,
				maxdepth = 1,
				separator = that.options.separator,
				spacer = that.options.spacer,
				placeholder = that.options.placeholder,
				defaultvalue = that.options.defaultvalue,
				$element = $(that.element);
			var choices = $element.find('option').map(function(){
				var val = $(this).val();
				if (val) {
					var selected = $(this).prop('selected'),
						disabled = $(this).prop('disabled'),
						txt = $(this).text();
					var segments = txt.split(separator);
					var depth = segments.length;
					if (depth > maxdepth) {
						maxdepth = depth;
					}
					var result = {
						originalLabel: txt,
						newLabel: segments[depth-1],
						value: val,
						depth: depth,
						selected: selected,
						disabled: disabled,
						children: []
					};
					return result;
				}
			});
			// Build up child values
			for (var depth=1; depth<=maxdepth; depth++) {
				$.each(choices, function() {
					var parent = this;
					if (parent.depth == depth) {
						$.each(choices, function() {
							var child = this;
							if (child.depth == depth+1 && child.originalLabel.match("^"+parent.originalLabel)==parent.originalLabel) { 
								parent.children.push(child);
							}
						});
					}
				});
			}
			var selectValues = [],
				lastDepth = 1;
			$.each(choices, function() {
				var choice = this;
				var item = $('<option/>');
				item.attr({ 'value': choice.value }).html(Array(4 * (choice.depth - 1)).join(spacer) + choice.newLabel);
				selectValues.push(item);
				lastDepth = choice.depth;
			});
			$element.find('option').remove().end();
			$element.append($('<option/>', {
				value: defaultvalue,
                text: placeholder
			}));
			$.each(selectValues, function(index, value) {
				 $element.append(value);
			});
			var trigger = ($.browser.mozilla) ? 'click' : 'mousedown';
			$element.on("change", function() {
				var selected = $('option:selected', this);
				$(this).data('currentValue', selected);
				var display = selected.clone();
				display.text($.trim(display.text()));
				selected.replaceWith(display);
				$(this).prop('selectedIndex', display.index());
			}).on(trigger, function() {
				if ($(this).prop('selectedIndex') == 0)
					return;
				var selected = $('option:selected', this);
				selected.replaceWith($(this).data('currentValue'));
				$(this).prop('selectedIndex', 0);
			});
		}
	};

	$.fn.selectHierarchy = function(options) {        
		return this.each(function() {
			if (!$.data(this, 'selectHierarchy')) {
				var selectHierarchy =  new SelectHierarchy(this, options);
				$.data(this, 'selectHierarchy', selectHierarchy);
				selectHierarchy.init();
			}
		});
	};
	
	$.fn.selectHierarchy.defaults = {
		debug: false,
		placeholder: 'Select One',
		defaultvalue: "",
		separator: ' > ',
		spacer: '&nbsp;'
	};
})(jQuery);
