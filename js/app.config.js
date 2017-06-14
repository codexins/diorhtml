
var app = window.app || window.scriptease;

app.NAME = 'app';
app.ROOT_URL = window.location.protocol+'//'+ window.location.host + window.location.pathname.replace('index.php', '');
app.SECURE_ROOT_URL = "";
app.DEFAULT_APP_NAME = "dior";
app.DEFAULT_VERSION = "2_2";
app.COUNTRY = "FR";
app.LOCALE = "fr_FR";
app.REGION = "EMEA";
app.ROOT_DOMAIN = "http://localhost";
app.BUILD_REVISION = "";
app.SCRIPT_MANAGER_FORMAT = "";

app.events = app.extend({}, app.events, {
	POPIN_INITIATED: 'onPopinInitiated',
	OPEN_POPIN: 'onOpenPopin',
	CLOSE_POPIN: 'onClosePopin'
});