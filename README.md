# Client (Server)
<a href="https://client-sandy.vercel.app" title="Client (Server)">
  <img src="public/1.png" title="Screenshot of application.">
</a>

 <p align="center"><a href="https://client-sandy.vercel.app">Live App</a><br><br>📚 Manage clients, projects, documentation and more in one easy to access website<br>For freelancers and small digital agencies.</p>

## Motivation
Inspired by my need to start a business and have everything client related in one place for accessibility and clarity.

## Features
- Sign up for your brand
- Request a web project in a easy to use form (instead of emails cobbled together specs)
- See updates made to the project via the project detail
- Responsive design

TODO:
- Chat
- Email Notifications
- Invoicing
- Stripe & Paypal Support
- Reporting

## Tech Stack
- HTML
- CSS
- Javascript
- React
- PostgreSQL
- Express

## Installation & Development 

### Postgres 
If you don't already have a postgres on your computer follow instructions here.

- [Install Postgres](https://www.postgresql.org/download/)
- Run server with (macOS & Linux) ```pg_ctl -D /usr/local/var/postgres start``` or (Windows) ```psql```
- Then create ```postgres``` user in terminal or cmd with ``createuser -Pw --interactive
``
- Then run ```createdb -U postgres client```

Potentially more in depth instructions: 

[MacOS & Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

[Windows](https://www.postgresql.org/download/windows/) 
> The installer is designed to be a straightforward, fast way to get up and running with PostgreSQL on Windows.

### Application

You'll need run this before client in order for the application to work completely. Also, may need to run `npm install postgrator -D`.

- Clone from [`https://github.com/joshuaakanetuk/client-server`](https://github.com/joshuaakanetuk/client-server)
- `cd` into `client-server`
- Run `npm i` 
- Run `npm run migrate` to create tables 
- (Optionally, needed for admin/client) Run seeds in folder ```/seeds/``` — ```psql -d client -f ./seeds/seed.client_<INSERT_DATA_MODEL>.sql ```



## Copyright
Copyright 2020, Joshua Akan-Etuk. 

<br>

<p align="center"><a href="https://joshuaakanetuk.com" title="Joshua Akan-Etuk">
  <img src="https://github.com/joshuaakanetuk/client/raw/master/public/favicon.png" alt="">
</a></p>