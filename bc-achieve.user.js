// ==UserScript==
// @name         BCAchieve
// @namespace    https://bcmc.ga/authors/tumble/
// @version      0.1.2.3
// @author       Tumble
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/modial/raw/master/modial.js
// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js
// @require      https://github.com/tumble1999/bc-notify/raw/master/bc-notify.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @run-at       document-start
// ==/UserScript==
(function () {
	"use strict";

	const uWindow = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

	if (uWindow.BCAchieve)
		return;

	let deps = [
		{
			obj: "TumbleMod",
			text: "// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js"
		},
		{
			obj: "Critterguration",
			text: "// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js"
		},
		{
			obj: "BCNotify",
			text: "// @require      https://github.com/tumble1999/bc-notify/raw/master/bc-notify.user.js"
		},
		{
			obj: "GM_getValue",
			text: "// @grant        GM_getValue"
		},
		{
			obj: "GM_setValue",
			text: "// @grant        GM_setValue"
		},
	];
	if (deps.map(dep => eval("typeof " + dep.obj)).includes("undefined")) throw "\nATTENTION MOD DEVELOPER:\nPlease add the following to your code:\n" + deps.map(dep => {
		if (eval("typeof " + dep.obj) == "undefined") return dep.text;
	}).filter(d => !!d).join("\n");

	let tasks = [], completion = load(),
		BCAchieve = new TumbleMod({
			id: "bcAchieve",
			abriv: "bca",
			name: "Achivements",
			author: "Tumble",
			tasks,
			completion,
			createAchievement
		}),
		//Setup achivement list
		achievementListPage = Critterguration.registerSettingsMenu(BCAchieve, () => {
			achievementList.querySelectorAll(".list-group-item").forEach(i => i.remove());

			tasks.sort((a, b) => (completion[b.id] || 0) / b.amount - (completion[a.id] || 0) / a.amount).forEach(task => {

				let status = "secondary";
				if (!!completion[task.id]) status = "primary";
				if (task.achieved) status = "success";
				if (task.hidden && status != "success") return;
				achievementList.addItem({
					name: task.name,
					color: status,
					description: task.description,
					footer: task.author || task.mod.name,
					corner: (completion[task.id] || 0) + "/" + task.amount,
					badge: completion[task.id] == task.amount ? "Done" : null,
					active: !!completion[task.id]
				});

			});
		}),
		achievementList = achievementListPage.createListGroup("Achivements");

	function createAchievement(task) {
		task.id = task.mod.id + "_" + (task.id || TumbleMod.camelize(task.name));
		if (!task.amount) task.amount = 1;
		tasks.push(task);

		// Automatically mark as achived after created
		if (completion[task.id] >= task.amount) task.achieved = true;

		task.achieve = function (amount = 1) {
			if (typeof completion[task.id] != "number") completion[task.id] = 0;
			completion[task.id] += amount;
			// save any potential changes
			save();

			//if (completion[task.id] > task.amount) completion[task.id] = task.amount;
			if (!task.achieved && completion[task.id] >= task.amount) {
				// Mark as achieved when completed
				task.achieved = true;
				BCNotify.notify({
					mod: BCAchieve,
					title: task.name + (task.amount == 1 ? "" : " (" + completion[task.id] + "/" + task.amount + ")"),
					body: task.description,
					icon: task.icon
				});
			}
		};
		task.set = function (amount) {
			task.achieve(amount - completion[task.id]);
		};

		task.completion = function () {
			return completion[task.id];
		};

		return task;
	}

	function load() {
		return GM_getValue("achivements") || {};
	}

	function save() {
		GM_setValue("achivements", completion);
	}

	uWindow.BCAchieve = BCAchieve;
})();