 old notes on 39...
Where I am is denoted by last number

1. Check host fingerprint, run this in console:

```
ssh-keygen -l -f /etc/ssh/ssh_host_ecdsa_key.pub
```

2. Saved off the hostname where working I forget these things [saving notes](https://www.quantuminati.com/2018/01/28/things-to-write-about/)

Create new SUDO user `run as root`
```sh
adduser user_name
usermod -aG sudo user_name
```

3. user user_name is now added, I save off a note with my convention of obfuscated passwds
4. Set up local [ssh keys](https://www.quantuminati.com/2018/01/28/things-to-write-about/) and sync
*locally*
```sh
ssh-keygen -t rsa -b 4096 -C "..."
```

5. Copy the saved .pub key file to remote ~/.ssh/authorized_keys
6. make sure ~/.ssh/authorized_keys is chmod 600
7. add to ssh config file replacing text in \<\>

```
Host < your_hostname_nickname >
	User < your_username >
	Hostname < fqdn_hostname >
	PreferredAuthentications publickey
	IdentityFile < /home/user_name/.ssh/id_rsa... >
```

8. Critical utility components

```sh
sudo apt install vim
sudo apt install pwgen
mkdir -p ~/.vim/colors
cd ~/.vim/colors
curl -O https://raw.githubusercontent.com/nanotech/jellybeans.vim/master/colors/jellybeans.vim
sudo timedatectl set-timezone America/Los_Angeles
```


9. Add this to your ~/.vimrc

```txt
colorscheme jellybeans
syntax on
if has("autocmd")
	au BufReadPost * if line("'\"") > 0 && line("'\"") <= line("$") | exe "normal! g\`\"" | endif
endif
set colorcolumn=80
```

10. Install mysql and database (space) for app

new method to update mysql root password but I wasn't able to, consider just always sudo mysql -u root or: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html

note to consider sudo service mysql stop/start (after the sudo mysqld command)

note: libmysqlclient-dev required or the python mysqlclient won't install

```sh
sudo apt update
sudo apt install mysql-server
sudo apt install libmysqlclient-dev
sudo mysql -u root
create database ka;
GRANT ALL PRIVILEGES ON ka.* TO 'ka'@'localhost' IDENTIFIED BY 'PASSWORD';
```
**During mysql install you will enter a mysql root password - no longer?**

A script for random or consider [xkcd password generator](http://preshing.com/20110811/xkcd-password-generator/)

```sh
pwgen 15
```

11. Install nginx

```sh
sudo apt update
sudo apt install nginx
```

12. Install python3 and related - appears to already be installed

```sh
sudo apt update
sudo apt install python3
sudo apt install python3-dev
sudo apt install python3-pip
sudo apt install virtualenv
```

13. Site specific configuration
*note i stuff env and server under 'cah' that gives the django project a generic name, but the env too...*

```sh
mkdir django-sites
cd django-sites/
mkdir ka
cd ka
virtualenv -p python3 env
source env/bin/activate
pip install django
pip install mysqlclient
pip install python-social-auth
pip install social-auth-app-django
pip install django-polymorphic
pip install Pillow
pip install django_extensions
pip install oauth2_provider
django-admin startproject
```

14. Edit the env/bin/activate script

```sh
# at the end of the deactivate method in the script - mine had 4 spaces instead of tab chars
	unset DATABASE_NAME
	unset DATABASE_USER
	unset DATABASE_PORT
	unset DATABASE_HOST
	unset DATABASE_PASSWORD
```

```sh
# at the end of the script
export DATABASE_NAME=ka
export DATABASE_USER=ka
export DATABASE_PORT=3306
export DATABASE_HOST=localhost
export DATABASE_PASSWORD="PASSWORD"
```

Confirm it is working

```sh
source env/bin/activate
```

15. Edit the project_name/project_name/settings.py section for DATABASES

```python
# My default had 4 spaces instead of tab chars

import os

# Don't echo everything about your env to the world 
DEBUG = False

LOGGING = {
	'version': 1,
	'disable_existing_loggers': False,
	'handlers': {
		'console': {
			'class': 'logging.StreamHandler',
		},
	},
	'loggers': {
		'django.request': {
			'handlers': ['console'],
			'level': 'INFO',
			'propogate': False
		}
	}
}

# And set up your DB
DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',
		'NAME': os.environ.get('DATABASE_NAME',''),
		'USER': os.environ.get('DATABASE_USER',''),
		'PASSWORD': os.environ.get('DATABASE_PASSWORD',''),
		'HOST': os.environ.get('DATABASE_HOST',''),
		'PORT': os.environ.get('DATABASE_PORT',''),
		'OPTIONS': {
			'sql_mode': 'STRICT_TRANS_TABLES',
		}
	}
}
# at the bottom
STATIC_ROOT = 'static'
```

add to nginx /etc/nginx/sites-enabled/default -> remember the trailing "/"
inside a server section

```
	location /static/ {
		alias /path/to/project/static/;
		expires modified +1w;
	}
```

run the command

```
python3 manage.py collectstatic
```


probably a good time to also update the "TEMPLATES" DIRS section as well

Confirm it works (and set up initial config)
```sh
python3 project_name/manage.py migrate
```

16. Create your super user

```sh
python project_name/manage.py createsuperuser
```

17. Edit nginx
```sh
sudo vim /etc/nginx/sites-available/default
```

```sh
# the following is still very sloppy and needs to be cleaned up
#comment the first line that normally is not commented, then the following inside the server.location section:
# add the server
server_name fqdn;
# uncomment things like this
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
# add things like this - but use the snakeoil the first time then your certs in
# ssl_certificate /etc/letsencrypt/live/fqdn/fullchain.pem
#       include snippets/ssl-<FQDN>.conf;
#       include snippets/ssl-<FQDN>.conf;

# after https working...
#        if ($scheme = http ) {                                                  
#                return 301 https://$server_name$request_uri;                    
#        }   

# replace with your preferred port
# try_files $uri $uri/ =404;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Server $host;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Forwarded-Port 443;
		proxy_pass http://127.0.0.1:8842;
```

Sample snippets file
```sh
ssl_certificate /etc/letsencrypt/live/<FQDN>/fullchain.pem;             
ssl_certificate_key /etc/letsencrypt/live/<FQDN>/privkey.pem;
```


```sh
sudo service nginx restart
```

you will need this at some point
and should document this test - https://www.ssllabs.com/ssltest/
```
cd /etc/ssl/certs
sudo time openssl dhparam -out dhparam.pem 4096
-- or --
sudo time openssl dhparam -outform PEM -out /etc/ssl/certs/dhparam.pem 4096
```

18. Edit python settings

```python
ALLOWED_HOSTS = ['fqdn']
```

19. Start and test access

```sh
python server/manage.py runserver 0.0.0.0:8842
```

Then access the site via your browser

20. SSL cert install

New certbot setup
```sh
sudo apt-get remove certbot
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
```

New certbot command

```sh
sudo certbot certonly --nginx
```
New certbot test dry run
```sh
sudo certbot renew --dry-run
```

Old certbot
```sh
sudo certbot certonly --text --keep-until-expiring --agree-tos --manual
```

certbot will give you a long string, drop it into this file
```sh
cat > //cert.txt - see example locations hijacking urls and views in python
```

create views.py
```python
from django.shortcuts import render

CERT_FILE = "cert.txt"

def certLog (request):
	return render(
		request,
		CERT_FILE,
		context={}
	)
```

edit urls.py to add this pattern
```python
from django.urls import path, re_path
# Above you added a views that needs to be included now
from project_name import views

...

	re_path(
		r'^.well-known/acme-challenge/',
		views.certLog
	)
```

update template dirs in settings.py:
```python
		
TEMPLATES = [                                                                   
    {                                                                           
        'BACKEND': 'django.template.backends.django.DjangoTemplates',           
        'DIRS': ['project_name', 'project_name/project_name'],
...
```

start server to finish certbot verification
```sh
python server/manage.py runserver 0.0.0.0:
```

allow certbot to continue

look at expiration date and set calendar reminder

```sh
sudo openssl dhparam -outform PEM -out /etc/ssl/certs/dhparam.pem 4096
```

```sh
sudo vim /etc/nginx/snippets/ssl-.conf
```

```sh
ssl_certificate /etc/letsencrypt/live//fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live//privkey.pem;
```

```sh
sudo vim /etc/nginx/snippets/ssl-params.conf
```

```sh
# from https://cipherli.st/
# and https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html

ssl_protocols TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
# Disable preloading HSTS for now. You can use the commented out header line that includes
# the "preload" directive if you understand the implications.
#add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;

ssl_dhparam /etc/ssl/certs/dhparam.pem;
```

```sh
sudo vim /etc/nginx/sites-available/default
```

uncomment the 443 listen lines and add the other 2 snippet references
```sh
listen 443 ssl default_server;
listen [::]:443 ssl default_server;

include snippets/ssl-.conf;
include snippets/ssl-params.conf;
```

```sh
sudo service nginx restart
```

you should now have https access to your site

21. For me I added polymorphic - then see my models for how I updated

```python
# to enable django-polymorphic - add to settings.py.
INSTALLED_APPS += (
	'polymorphic',
	'django.contrib.contenttypes',
)
```

22. Need to add your "app" to the INSTALLED_APPS so it can find your template html files
```python
# add to settings.py

INSTALLED_APPS += (
	'your_app_name'
_
```

23. Get a baseline view and custom error handling going

```html
# //base.html

{% load static %}

{% block main %}{% endblock %}

```

```html
# //home.html
{% extends 'base.html' %}
{% block main %}
{% load static %}
Hello
{% endblock %}
```

```html
# //404.html
Mr. Watson--come here-- The resource we are looking for is missing.
```

```html
# //500.html
Mr. Watson--come here-- there has been an error. Luckily we are watching and will work to repair this as quickly as possible.
```

###Add a 400 too!

```python
# add the following to //views.py

import logging, functools, time

logger = logging.getLogger("django.request")

def check_and_log_basics (func):
	"""Some logic for all views"""
	@functools.wraps(func)
	def wrapper(*args, **kwargs):
		logger.info("========================================" +
			"========================================")
		logger.info("Request IP: " + args[0].META.get('HTTP_X_FORWARDED_FOR'))
		#logger.info(args[0].headers.get('user-agent', "no UA"))
		stime = time.perf_counter()
		rval = func(*args, **kwargs)
		rtime = time.perf_counter() - stime
		logger.info(f"Finished {func.__name__!r} in {rtime:.4f} secs")
		return rval

	return wrapper


@check_and_log_basics
def home (request):
	return render(
		request,
		"home.html",
		context={}
	)

@check_and_log_basics
def custom404 (request, e):
	return render(
		request,
		"404.html",
		status=404,
		context={}
	)

@check_and_log_basics
def custom500 (request):
	return render(
		request,
		"500.html",
		status=500,
		context={}
	)
```

```python
# add the following to //urls.py

from django.urls import path, re_path 

#inside the array
re_path(
	r'^$',
	views.home,
	name='home'
)

# outside the main array
handler404 = views.custom404
handler500 = views.custom500
```

24. Now we can test some things

Log in ->
https://fqdn/admin/login

25. Now lets get social auth working

fb auth stuff from here with some hacks as config and some api changes
http://artandlogic.com/2014/04/tutorial-adding-facebooktwittergoogle-authentication-to-a-django-application/
adding my django project named 'server' to settings.py
INSTALLED_APPS = (
'django.contrib.admin',
'django.contrib.auth',
...
'',
)

- not sure NEED TO UPDATE add base.html and home.html and views.py,originals in this directory
- incorectly had to import views from . in urls.py
- incorrectly had to add my template search dir in settings.py
-  add installed app 'social.apps.django_app.default',
-  add to template context processors...
```
#settings.py
#Add to INSTALLED_APPS
    'social.apps.django_app.default',
    'social_django',
    'oauth2_provider'

# Then
TEMPLATES = [
	{
		'OPTIONS': {
			'context_processors': [
... existing...
				'social.apps.django_app.context_processors.backends',
				'social.apps.django_app.context_processors.login_redirect',

# added at end of settings.py
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

AUTHENTICATION_BACKENDS = (
   'social_core.backends.facebook.FacebookOAuth2',
   'social_core.backends.google.GoogleOAuth2',
   'social_core.backends.twitter.TwitterOAuth',
   'django.contrib.auth.backends.ModelBackend',
) 

SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/'
SOCIAL_AUTH_FACEBOOK_SCOPE = [
    'email'
]

SOCIAL_AUTH_PIPELINE = (
    # Get the information we can about the user and return it in a simple
    # format to create the user instance later. On some cases the details are
    # already part of the auth response from the provider, but sometimes this
    # could hit a provider API.
    'social.pipeline.social_auth.social_details',

    # Get the social uid from whichever service we're authing thru. The uid is
    # the unique identifier of the given user in the provider.
    'social.pipeline.social_auth.social_uid',

    # Verifies that the current auth process is valid within the current
    # project, this is were emails and domains whitelists are applied (if
    # defined).
    'social.pipeline.social_auth.auth_allowed',

    # Checks if the current social-account is already associated in the site.
    'social.pipeline.social_auth.social_user',

    # Make up a username for this person, appends a random string at the end if
    # there's any collision.
    'social.pipeline.user.get_username',

    # Associates the current social details with another user account with
    # a similar email address. Disabled by default.
    'social.pipeline.social_auth.associate_by_email',

    # bad web reference to add?
    #'users.pipeline.require_email',
    
    # Send a validation email to the user to verify its email address.
    # Disabled by default.
    # 'social.pipeline.mail.mail_validation',

    # Create a user account if we haven't found one yet.
    'social.pipeline.user.create_user',

    # Create the record that associated the social account with this user.
    'social.pipeline.social_auth.associate_user',

    # Populate the extra_data field in the social record with the values
    # specified by settings (and the default ones like access_token, etc).
    'social.pipeline.social_auth.load_extra_data',

    # Update the user record with any changed info from the auth service.
    'social.pipeline.user.user_details',

)

# To be configured
#SOCIAL_AUTH_FACEBOOK_KEY = os.environ.get('SOCIAL_AUTH_FACEBOOK_KEY','')
#SOCIAL_AUTH_FACEBOOK_SECRET = os.environ.get('SOCIAL_AUTH_FACEBOOK_SECRET','')
#SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY','')
#SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', '')
#EMAIL_HOST = os.environ.get('EMAIL_HOST','')
#EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER','')
#EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD','')
#EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS','')
```

In facebook oAuth setup the following redirect URIs

https://fqdn/complete/facebook/


python3 manage.py migrate

in urls.py add
from django.conf.urls import url, include 

and in the urlpatterns add 

path('', include(('social.apps.django_app.urls', 'app_name'), namespace='social')),
path('', include(('django.contrib.auth.urls', 'app_name'), namespace='auth')),

need to update env/bin/active

        unset SOCIAL_AUTH_FACEBOOK_KEY                                          
        unset SOCIAL_AUTH_FACEBOOK_SECRET

export SOCIAL_AUTH_FACEBOOK_KEY='705808540227232'
export SOCIAL_AUTH_FACEBOOK_SECRET='f3dbd697492c6a95d98e769fd0239c07'

Then uncomment in settings

SOCIAL_AUTH_FACEBOOK_KEY = os.environ.get('SOCIAL_AUTH_FACEBOOK_KEY','')        
SOCIAL_AUTH_FACEBOOK_SECRET = os.environ.get('SOCIAL_AUTH_FACEBOOK_SECRET','')


oauth redirect uris https://fqdn/complete/facebook
https://fqdn/oauth/complete/facebook

<a href="{% url 'social:begin' 'facebook' %}">Login with Facebook</a> 

- NOTE!!!
- I added a custom profile to the pipline file and referenced from settings.py
- def run_profile(backend, user, response, *args, **kwargs):
- print "****here", str(response['id']), str(response['access_token'])
- print json.dumps(response), str(backend)
- -logger.info("here logger")

Some potential baseline items to include in the base template 

From here: https://bootstrap-vue.js.org/docs

``` html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,800;0,900;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>            
<script src="https://unpkg.com/@popperjs/core@2"></script>                      
<script src="https://unpkg.com/portal-vue"></script>                             
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
```


