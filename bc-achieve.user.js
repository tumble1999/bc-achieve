// ==UserScript==
// @name         BCAchieve
// @namespace    https://bcmc.ga/authors/tumble/
// @version      0.1.0.1
// @author       Tumble
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/modial/raw/master/modial.js
// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js
// @require      https://github.com/tumble1999/bc-notify/raw/master/bc-notify.user.js
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

	if (uWindow.Achievements)
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
		}
	];
	if (deps.map(dep => eval("typeof " + dep.obj)).includes("undefined")) throw "\nATTENTION MOD DEVELOPER:\nPlease add the following to your code:\n" + deps.map(dep => {
		if (eval("typeof " + dep.obj) == "undefined") return dep.text;
	}).filter(d => !!d).join("\n");

	let tasks = [], completion = {},
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
		achivementListPage = Critterguration.registerSettingsMenu(BCAchieve, () => {
			achivementList.querySelectorAll("a").forEach(i => i.remove());

			tasks.forEach(task => {
				let status = "secondary",
					value = completion[task.id] * task.amount || 0;
				if (completion[task.id]) status = "primary";
				if (completion[task.id] == task.amount) status = "success";
				achivementList.addItem({
					name: task.name,
					color: status,
					description: task.description,
					footer: task.mod.name,
					corner: value + "/" + task.amount,
					badge: completion[task.id] == 1 ? "Done" : null
				});

			});
		}),
		achivementList = achivementListPage.createListGroup("Achivements");

	function createAchievement({
		mod,
		id,
		name,
		description,
		icon,
		amount = 1,
	}) {
		let task = {
			mod, name, description, icon, amount,
			id: mod.id + "_" + (id || TumbleMod.camelize(name))
		};
		tasks.push(task);

		task.achieve = function (amount = 1) {
			if (typeof completion[task.id] != "number") completion[task.id] = 0;
			completion[task.id] += amount / task.amount;
			if (completion[task.id] == 1)
				BCNotify.notify({
					mod: BCAchieve,
					title: name + (task.amount == 1 ? "" : " (" + completion[task.id] * task.amount + "/" + task.amount + ")"),
					body: description,
					icon
				});
		};

		return task;
	}

	uWindow.BCAchieve = BCAchieve;
})();