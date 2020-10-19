#!/bin/bash

systemctl daemon-reload

# Allow these packages to not exist on the target system, by
# forwarding any failures here to /dev/null
systemctl disable managementd.service > /dev/null 2>&1
systemctl stop managementd.service > /dev/null 2>&1
systemctl disable thermal-recorder.service > /dev/null 2>&1
systemctl stop thermal-recorder.service > /dev/null 2>&1

systemctl enable feverscreen.service
systemctl enable feverscreen-updater.service
systemctl enable leptond.service
systemctl restart leptond.service
systemctl restart feverscreen.service
systemctl start feverscreen-updater.service ## Don't restart feverscreen-updater or else it could restart itself causing bad updates
