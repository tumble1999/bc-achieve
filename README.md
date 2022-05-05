# BC Achievements
## Install
```js
// @require https://github.com/tumble1999/bc-achieve/raw/master/bc-achieve.user.js
```

## Usage
```js
BCAchieve.createAchievement({
	mod: BCAchieve,
	name: "Test Achivement",
	description: "Test the achivement system."
});

BCAchieve.createAchievement({
	mod: BCAchieve,
	name: "Test Incremental Achivement",
	description: "Test the achivement system.",
	amount: 5
});

BCAchieve.createAchievement({
	mod: BCAchieve,
	name: "Test Image Achivement",
	description: "Test the achivement system.",
	icon: "https://boxcritters.com/images/menu/Btn_Menu_Items_A.png"
});
```