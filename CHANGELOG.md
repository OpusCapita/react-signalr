# Changelog

* In general follow (https://docs.npmjs.com/getting-started/semantic-versioning) versioning.

## 4.0.0
* Using hub's withAutomaticReconnect() for automatic reconnection (https://docs.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-3.0?view=aspnetcore-3.1)

## 3.3.0
* Configuration change: negotiation phase will be skipped from now on
* Rearranged src folder and removed .npmignore in order to fix npm related problems
* Fixed ejs/es package paths in package.json
* Reverted to a previous version of @aspnet/signalr
* Fixed a bug in stopHub fn.

## 3.2.2
* Rearranged src folder and removed .npmignore in order to fix npm related problems

## 3.2.1
* Fixed ejs/es package paths in package.json

## 3.2.0
* Package updates, incl. @aspnet/signalr update from version 1.0.0 to 1.1.0.

## 3.1.0
* Implemented methods in hub proxy for adding and removing clients to and from named groups

## 3.0.0
* injectSignalR can now be used as a decorator (contains breaking changes)
* Superficial code restructuring, linter fixes, etc.

## 2.0.0
* Migrated to .NET Core 2.1

## 1.0.0
* Initial release
