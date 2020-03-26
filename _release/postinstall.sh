#!/bin/bash

systemctl daemon-reload

systemctl disable managementd.service
systemctl stop managementd.service
systemctl disable thermal-recorder.service
systemctl stop thermal-recorder.service

systemctl enable feverscreen.service
systemctl enable leptond.service
systemctl restart leptond.service
systemctl restart feverscreen.service
