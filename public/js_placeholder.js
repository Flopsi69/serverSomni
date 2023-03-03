var APP_API_URL = "http://localhost:3000/api/";
const API_URL = "https://stamped.io/api/";
var generate_reward_away_message = true;

function initStamped() {
	console.log('initStamped');
	StampedFn.init({ apiKey: '{{stamped_key_public}}', storeUrl: 'somnifix.myshopify.com' });

	// StampedFn.on('stamped:init:starting', function(){
	setTimeout(() => {
		console.log('starting');

		StampedFn.initRewards({
				customerId: '{{ stamped_customer_id | escape }}', // your own internal numeric ID of the customer
				customerEmail: '{{ stamped_customer_email | escape }}',
				customerFirstName: '{{ stamped_customer_first_name | escape }}',
				customerLastName: '{{ stamped_customer_last_name | escape }}',
				customerTags: '{{ stamped_customer_tags | escape }}',
				totalOrders: '{{ stamped_customer_orders_count | escape }}', // numeric indicating customer's total orders placed with your store
				totalSpent: '{{ stamped_customer_total_spent | escape }}', // numeric indicating customer's total amount spent across all orders
				isAcceptMarketing: true, // true or false
				authToken: '{{ auth_token }}'
			});
	}, 700)

	// });

	setBirthdaySelects();

	function addEventListenerStamped(el, eventName, handler) { 
		if (el.addEventListener) { el.addEventListener(eventName, handler); }
		else { el.attachEvent('on' + eventName, function () { handler.call(el); }); } 
	}


	addEventListenerStamped(document, 'stamped:rewards:init', function(e) {
		console.log('initRewards', e);

		setTimeout(start, 50)
	})
}

async function start() {
	console.log('start')

	let stampedData = StampedFn.getDataRewards();

	console.log('stampedData', stampedData)

	if (!stampedData) return;

	$('.bg').click(function(){
		if ($(this).hasClass('active')) {
			$('.bg, .popup').removeClass('active');
		}
	})

	let userReferralUrl = stampedData.customer.urlReferral;

	if (userReferralUrl) {
		$(".copy-ref-link-button").click(function(){
			StampedFn.rewardsReferralCopy();
		});

		$("a.stamped-share-link").each(function(){
			$(this).attr("target", "_blank").attr('href', $(this).attr('href').replaceAll("!!REF!!", userReferralUrl));
		});
	}

	setUserRewardsInfo(stampedData);
	handleReview();
	handleBirthday(stampedData);

// 3528699904115
// let appSavedData = await fetch(APP_API_URL + 'stamped?customer_id=3528699904115');
	let appSavedData = await fetch(APP_API_URL + 'stamped?customer_id=' + {{ customer.id }});
	appSavedData = await appSavedData.json();
	console.log(appSavedData);

	if (appSavedData.selfie) {
		$('#task-upload-selfy button').hide();
		$('#task-upload-selfy .check-mark-wrapper').show();
	} else {
		handleSelfie(stampedData);
	}

	if (appSavedData.video) {
		$('#task-upload-video button').hide();
		$('#task-upload-video .check-mark-wrapper').show();
	} else {
		handleVideo(stampedData);
	}

	document.querySelectorAll('.notify_item').forEach(item => {
		if (appSavedData.answers.includes(item.dataset.question)) {
			$(item).remove()
		} else {
			$(item).show();
		}
	})

	if (document.querySelectorAll('.notify_item').length) {
		handleQuestions(stampedData);
	} else {
		$('#task-answer-question button').hide();
		$('#task-answer-question .check-mark-wrapper').show();
	}

	$('.more_zees_loading').hide();
	$('.more_zees').show();

	renderTasksMetric();
}

function setUserRewardsInfo(stamped) {
	$(".your_zees .balance_points .points").html(stamped.points.points+'<span>Zees</span>');

	if (!stamped.campaigns?.spendings?.length) return false;

	stamped.campaigns.spendings.forEach(function(item){
		let rewardEl = $('.reward[data-reward-id='+item.id.toString()+']');

		if (!rewardEl.length) return false;

		rewardEl.data('points', item.pointsMaximum );

		rewardEl.find('.amount').text(item.pointsMaximum + ' Zees');

		if(stamped.points.points > 0) {
			rewardEl.find('.amount').addClass('active');
		} else {
			rewardEl.find('button').addClass('disabled');
		}

		setRewardPercent(rewardEl, stamped.points.points, item.pointsMaximum);

		rewardEl.find('button:not(.disabled)').click(function(){
			$(this).addClass('disabled');

			jQuery.ajax({
				type: 'POST',
				url: '/cart/clear.js',
				dataType: 'json',
				success: function(e) {
					jQuery.ajax({
						type: 'POST',
						url: '/cart/add.js',
						data: {
							"quantity": 1,
							"id": rewardEl.data('variant')
						},
						dataType: 'json',
						success: function() {
							StampedFn.rewardsRedeem(rewardEl.find('button'), {
								campaignId: item.id,
								points: stamped.points.points
							}, function(res) {
								if (res.resultRewardSpend == 1) {
									window.location = '/checkout?discount=' + res.rewardCampaignCoupon.couponCode;
								}
							});
						}
					});
				}
			});
		});
	});
}

function handleReview() {
	$.get(API_URL + 'widget/reviews', {
		'apiKey': '{{ stamped_key_public }}',
		'storeUrl': 'somnifix.myshopify.com',
		'email': '{{ stamped_customer_email | escape }}'
	}, function (res) {
		if(res && res.data.length) {
			$('#task-review .btn_blue').hide();
			$('#task-review .check-mark-wrapper').show();
		} else {
			$('#task-review .check-mark-wrapper').hide();

			$('#task-review .btn_blue').show().click(function(){
				window.open('https://somnifix.com/products/mouth-strips-snoring-sleep-aids#stamped-main-widget', '_blank');
			});
		}
	});
}

function handleBirthday(stamped) {
	if (!stamped.customer?.dateBirthday) {
		$('#task-birthday button').show();
		$('#task-birthday .check-mark-wrapper').hide();
		return false;
	}

	let year = new Date(stamped.customer.dateBirthday).getFullYear()
	let month = new Date(stamped.customer.dateBirthday).getMonth()
	let date = new Date(stamped.customer.dateBirthday).getDate()

	if (year && month && date) {
		$('#birthday-day').val(date);
		$('#birthday-month').val(month);
		$('#birthday-year').val(year);
	}

	$('#task-birthday button').hide();
	$('#task-birthday .check-mark-wrapper').show();
}

function handleSelfie(stamped) {
	var uploadImage = cloudinary.createUploadWidget({
		cloudName: 'ddkmydkev',
		folder: 'somnifix/selfie',
		maxImageFileSize : 5*1024*1024,
		uploadPreset: 'mb2rilhs',
		showCompletedButton: true
	}, async (error, result) => { 
		if (!error && result && result.event === "success") {
			console.log('result upload Image')

			const { url, path, asset_id } = result.info

			const res = await fetch(APP_API_URL + 'selfie?customer_id=' + {{ customer.id }}, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({url, path, asset_id })
			});

			const data = await res.json();

			console.log('responseSaveImage', data);

			StampedFn.rewardsCreateActivity({
				campaignId: 16558,
				callback: function(data){
					uploadImage.close();
					$('#task-upload-selfy button').hide();
					$('#task-upload-selfy .check-mark-wrapper').show();
					alert('Thank you. You will get your Zees soon.');
					location.reload();
				}
			});

			return false;
		}
	});

	$('#task-upload-selfy button').show();
	$('#task-upload-selfy .check-mark-wrapper').hide();

	$('.to_photo_upload').click(function () {
		uploadImage.open();
	})
}

function handleVideo(stamped) {
	var uploadVideo = cloudinary.createUploadWidget({
		cloudName: 'ddkmydkev',
		folder: 'somnifix/video',
		maxVideoFileSize : 5*1024*1024,
		showCompletedButton: true,
		uploadPreset: 'mb2rilhs'
	}, async (error, result) => { 
		if (!error && result && result.event === "success") {
			console.log('result upload Video')

			const { url, path, asset_id } = result.info

			const res = await fetch(APP_API_URL + 'video?customer_id=' + {{ customer.id }}, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({url, path, asset_id })
			});

			const data = await res.json();

			console.log('responseSaveImage', data);

			StampedFn.rewardsCreateActivity({
				campaignId: 16559,
				callback: function(data){
					uploadVideo.close();
					$('#task-upload-video button').hide();
					$('#task-upload-video .check-mark-wrapper').show();
					alert('Thank you. You will get your Zees soon.');
					location.reload();
				}
			});

			return false;
		}
	});

	$('#task-upload-video button').show();
	$('#task-upload-video .check-mark-wrapper').hide();

	$('.to_video_upload').click(function () {
		uploadVideo.open();
	})
}

function handleQuestions(stamped) {
	$('.answer-variant').click(function(){
		$('.answer-variant').removeClass('selected');
		$(this).addClass('selected');
		$('#answer').val($(this).text());
	})
// let questions = res.questions;
	document.querySelectorAll('.notify_item').forEach(function(item){		
		item.addEventListener('click', function(){
			$('#answer').val('');
			$('.answer-variant').removeClass('selected');
			$('.questions, .bg').addClass('active');

			$('.question__inner').removeClass('active-question').hide();
			$('.question__inner[data-question="' + item.dataset.question + '"]').addClass('active-question').show();
		})
	});

	$('.questions.popup .btn_blue').click(async function(){
		let answer = $('#answer').val();
		let question = $('.active-question').data('question')

		if(answer) {
			$(this).addClass('btn-loading');
			const res = await fetch(APP_API_URL + 'question?customer_id=' + {{ customer.id }}, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({answer, question})
			});

			const data = await res.json();

			console.log('responseSaveQuestion', data);

			StampedFn.rewardsCreateActivity({
				campaignId: 16622,
				callback: function(data){
					$('.popup.active').removeClass('active');
					$('.bg').removeClass('active');
					$('.notify_item[data-question="'+question+'"]').remove();
					$('btn-loading').removeClass('btn-loading')
					alert('Thank you. You will get your Zees soon.');
					location.reload();
				}
			});

		} else {
			alert('Answer a question');
		}
	});

	$('#task-answer-question .btn_blue').click(function(){
		if (document.querySelectorAll('.notify_item').length) {
			$('.notify_item:visible').first().click();
		} else {
			$('#task-answer-question button').hide();
			$('#task-answer-question .check-mark-wrapper').show()
		}
	});

	$('#task-answer-question button').show();
	$('#task-answer-question .check-mark-wrapper').hide();
}

function setBirthdaySelects() {
	for(let i = 1; i < 32; i++) {
		$('#birthday-day').append('<option value="'+((i < 10) ? '0'+i.toString() : i) +'">'+i+'</option>');
	}

	for(let i = 2016; i > 1900; i--) {
		$('#birthday-year').append('<option value="'+i+'">'+i+'</option>');
	}

	$(".birthday .btn_blue").click(function(){
		StampedFn.rewardsTriggerEarn({
			campaignEventType: "AccountBirthday",
			birthday: $('#birthday-year').val()+"-"+$('#birthday-month').val()+"-"+$('#birthday-day').val(),
			callback: function(){
				$('.popup.active').removeClass('active');
				$('.bg').removeClass('active');
				alert("Birthday is updated");
				location.reload();
			}
		});
	});
}

function setRewardPercent(rewardEl, myPoints, rewardPoints) {
	let percent = myPoints/rewardPoints*100;
	percent = Math.round(percent);

	if(percent > 100) {
		percent = 100 ;
	}

	rewardEl.find('.complete-percent').text(percent.toString()+'%');

	if(percent > 0) {
		stroke_dashoffset = 360 - Math.round( (360 - 90) * (percent / 100) );
		rewardEl.find('.progress_bar svg').css('stroke-dashoffset', stroke_dashoffset);
	}

	if(!generate_reward_away_message) return false;

	generate_reward_away_message = false;

	if(percent != 100 && percent != 0) {
		$('.rewards > p').text('You are ' + percent.toString() + '% way to get 4-week SomniFix pack for FREE for your Zees');
	}
}

function renderTasksMetric() {
	let unlocked = $('.more_zees .check-mark-wrapper:visible').length;
	let locked = 6 - unlocked;
	$('.unlocked_rewards .unlock').html(unlocked + '<span>Unlocked</span>');
	$('.unlocked_rewards .lock').html(locked + '<span>Locked</span>');
}