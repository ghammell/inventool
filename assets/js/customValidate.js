$(document).ready(function() {
	$('.form-sign-in').validate({
		rules: {
			firstName: {
				required: true
			},

			lastName: {
				required: true
			},

			title: {

			},

			email: {
				required: true,
				email: true
			}, 

			password: {
				required: true,
				minlength: 6
			},

			confirmation: {
				required: true,
				equalTo: '#password'
			}
		},
		success: function(element) {
			var successIndicator = $('<span style="display: none;" class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>');
			element.addClass('valid').append(successIndicator);
			successIndicator.fadeIn();
		}
	});
});