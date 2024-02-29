# Planning Poking

## Tech used
### Back
- Deno
- Oak
- MongoDB (optional)
### Front
- Angular
- Angular Material
- TailwindCSS

## Installation
You need to install npm and deno to run this application. Use these commands to check that they are installed:
```
for npm : npm -v
for deno : deno -V
```
Both should print the version

## How to run it
In the root folder, execute :
```
deno task front
deno task back
```

## Todo
- [ ] Internationalization
- [ ] Accessibility (WCAG and mobile screen)
- [ ] Security 
- [ ] Clean the front (more component to make plan-poker component more readable)
- [ ] Stronger unit testing
- [ ] Add more functionnality
  - [ ] Customize card value (maybe add an input or predefinied suits like 1,2,3,4...)
  - [ ] Add Role to user in the room (impact front and back)
  - [ ] Add better result screen (the number of people who vote X etc)
  - [ ] Export function
  - ...
