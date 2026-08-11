window.CB_DATA = {
counties: [
  {
    "id": "turkana",
    "name": "Turkana",
    "regionId": "asal_north",
    "regionName": "ASAL North",
    "areaKm2": 68680,
    "population": 926976,
    "centroid": [
      35.3583,
      3.1747
    ],
    "bbox": [
      33.9928,
      0.9188,
      36.7237,
      5.4306
    ],
    "hasModelCoverage": true
  },
  {
    "id": "marsabit",
    "name": "Marsabit",
    "regionId": "asal_north",
    "regionName": "ASAL North",
    "areaKm2": 70961,
    "population": 459785,
    "centroid": [
      37.6983,
      2.8602
    ],
    "bbox": [
      36.0498,
      1.2629,
      39.3468,
      4.4575
    ],
    "hasModelCoverage": true
  },
  {
    "id": "samburu",
    "name": "Samburu",
    "regionId": "asal_north",
    "regionName": "ASAL North",
    "areaKm2": 21022,
    "population": 310327,
    "centroid": [
      37.1838,
      1.5407
    ],
    "bbox": [
      36.2866,
      0.5654,
      38.0809,
      2.5161
    ],
    "hasModelCoverage": false
  },
  {
    "id": "isiolo",
    "name": "Isiolo",
    "regionId": "asal_north",
    "regionName": "ASAL North",
    "areaKm2": 25336,
    "population": 268002,
    "centroid": [
      38.1626,
      1.0066
    ],
    "bbox": [
      36.8644,
      -0.0842,
      39.4608,
      2.0974
    ],
    "hasModelCoverage": true
  },
  {
    "id": "wajir",
    "name": "Wajir",
    "regionId": "asal_northeast",
    "regionName": "ASAL Northeast",
    "areaKm2": 56686,
    "population": 781263,
    "centroid": [
      39.9406,
      1.9262
    ],
    "bbox": [
      38.8886,
      0.1843,
      40.9926,
      3.6681
    ],
    "hasModelCoverage": true
  },
  {
    "id": "mandera",
    "name": "Mandera",
    "regionId": "asal_northeast",
    "regionName": "ASAL Northeast",
    "areaKm2": 25940,
    "population": 867457,
    "centroid": [
      40.8408,
      3.2295
    ],
    "bbox": [
      39.7753,
      2.1763,
      41.9063,
      4.2828
    ],
    "hasModelCoverage": true
  },
  {
    "id": "garissa",
    "name": "Garissa",
    "regionId": "asal_northeast",
    "regionName": "ASAL Northeast",
    "areaKm2": 44175,
    "population": 841353,
    "centroid": [
      40.112,
      -0.5191
    ],
    "bbox": [
      38.6617,
      -2.0329,
      41.5622,
      0.9947
    ],
    "hasModelCoverage": true
  },
  {
    "id": "kitui",
    "name": "Kitui",
    "regionId": "asal_eastern",
    "regionName": "ASAL Eastern",
    "areaKm2": 30497,
    "population": 1136187,
    "centroid": [
      38.3346,
      -1.5595
    ],
    "bbox": [
      37.594,
      -3.0675,
      39.0751,
      -0.0515
    ],
    "hasModelCoverage": true
  },
  {
    "id": "makueni",
    "name": "Makueni",
    "regionId": "asal_eastern",
    "regionName": "ASAL Eastern",
    "areaKm2": 8009,
    "population": 987653,
    "centroid": [
      37.8303,
      -2.2536
    ],
    "bbox": [
      37.1415,
      -2.9898,
      38.5191,
      -1.5175
    ],
    "hasModelCoverage": true
  },
  {
    "id": "machakos",
    "name": "Machakos",
    "regionId": "asal_eastern",
    "regionName": "ASAL Eastern",
    "areaKm2": 6208,
    "population": 1421932,
    "centroid": [
      37.3721,
      -1.2782
    ],
    "bbox": [
      36.876,
      -1.7802,
      37.8681,
      -0.7761
    ],
    "hasModelCoverage": true
  },
  {
    "id": "tharaka_nithi",
    "name": "Tharaka-Nithi",
    "regionId": "asal_eastern",
    "regionName": "ASAL Eastern",
    "areaKm2": 2639,
    "population": 393177,
    "centroid": [
      37.8085,
      -0.1905
    ],
    "bbox": [
      37.3078,
      -0.45,
      38.3091,
      0.0689
    ],
    "hasModelCoverage": false
  }
],
issues: {
"2026-08": {
  "id": "2026-08",
  "status": "published",
  "initDate": "2026-08-01",
  "generatedAt": "2026-08-04T06:42:11Z",
  "contentHash": "c41f8a90b3e2d7665f0a1d9c84f2b7ae51c6d3908e2a4b7f1d0c5e8a93b6f214",
  "run": {
    "source": "ECMWF SEAS5",
    "ensembleMembers": 51,
    "ensembleReduction": "member_wise",
    "forecastGrib": "seas5_20260801_tp_t2m_51mem.grib2",
    "climatologyGrib": "seas5_clim_1993-2016_08.grib2",
    "codeCommit": "9f3d2c1",
    "droughtModel": "cascade-gbm v0.4.1",
    "bridgeModel": "bridge-ridge v0.2.0",
    "labelVersion": "vci3m_v1",
    "featureCoverage": 0.83
  },
  "config": {
    "threshold": 0.25,
    "thresholdRationale": "NDMA drought bulletin trigger review, March 2026: P(VCI3M below 20) at 0.25 balances misses against alert fatigue on the 2019-2025 record."
  },
  "forecasts": [
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.093,
      "probP10": 0.086,
      "probP90": 0.094,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.21,
        "near": 0.42,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.157,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.243,
      "probP10": 0.212,
      "probP90": 0.255,
      "ensembleAgreement": 0.647,
      "membersAboveThreshold": 33,
      "membersTotal": 51,
      "terciles": {
        "below": 0.39,
        "near": 0.36,
        "above": 0.25
      },
      "signal": "normal",
      "margin": -0.007,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.337,
      "probP10": 0.28,
      "probP90": 0.397,
      "ensembleAgreement": 0.922,
      "membersAboveThreshold": 47,
      "membersTotal": 51,
      "terciles": {
        "below": 0.47,
        "near": 0.33,
        "above": 0.2
      },
      "signal": "watch",
      "margin": 0.087,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.093,
      "probP10": 0.086,
      "probP90": 0.094,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.21,
        "near": 0.42,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.157,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.243,
      "probP10": 0.212,
      "probP90": 0.255,
      "ensembleAgreement": 0.647,
      "membersAboveThreshold": 33,
      "membersTotal": 51,
      "terciles": {
        "below": 0.39,
        "near": 0.36,
        "above": 0.25
      },
      "signal": "normal",
      "margin": -0.007,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.337,
      "probP10": 0.28,
      "probP90": 0.397,
      "ensembleAgreement": 0.922,
      "membersAboveThreshold": 47,
      "membersTotal": 51,
      "terciles": {
        "below": 0.47,
        "near": 0.33,
        "above": 0.2
      },
      "signal": "watch",
      "margin": 0.087,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.093,
      "probP10": 0.086,
      "probP90": 0.094,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.21,
        "near": 0.42,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.157,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.243,
      "probP10": 0.212,
      "probP90": 0.255,
      "ensembleAgreement": 0.647,
      "membersAboveThreshold": 33,
      "membersTotal": 51,
      "terciles": {
        "below": 0.39,
        "near": 0.36,
        "above": 0.25
      },
      "signal": "normal",
      "margin": -0.007,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.337,
      "probP10": 0.28,
      "probP90": 0.397,
      "ensembleAgreement": 0.922,
      "membersAboveThreshold": 47,
      "membersTotal": 51,
      "terciles": {
        "below": 0.47,
        "near": 0.33,
        "above": 0.2
      },
      "signal": "watch",
      "margin": 0.087,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.284,
      "probP10": 0.284,
      "probP90": 0.284,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.44,
        "near": 0.37,
        "above": 0.19
      },
      "signal": "watch",
      "margin": 0.034,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.426,
      "probP10": 0.016,
      "probP90": 0.606,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.52,
        "near": 0.3,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.176,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.005,
      "probP10": 0.002,
      "probP90": 0.006,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.18,
        "near": 0.44,
        "above": 0.38
      },
      "signal": "normal",
      "margin": -0.245,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.284,
      "probP10": 0.284,
      "probP90": 0.284,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.44,
        "near": 0.37,
        "above": 0.19
      },
      "signal": "watch",
      "margin": 0.034,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.426,
      "probP10": 0.016,
      "probP90": 0.606,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.52,
        "near": 0.3,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.176,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.005,
      "probP10": 0.002,
      "probP90": 0.006,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.18,
        "near": 0.44,
        "above": 0.38
      },
      "signal": "normal",
      "margin": -0.245,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.284,
      "probP10": 0.284,
      "probP90": 0.284,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.44,
        "near": 0.37,
        "above": 0.19
      },
      "signal": "watch",
      "margin": 0.034,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.426,
      "probP10": 0.016,
      "probP90": 0.606,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.52,
        "near": 0.3,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.176,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.005,
      "probP10": 0.002,
      "probP90": 0.006,
      "ensembleAgreement": 0,
      "membersAboveThreshold": 0,
      "membersTotal": 51,
      "terciles": {
        "below": 0.18,
        "near": 0.44,
        "above": 0.38
      },
      "signal": "normal",
      "margin": -0.245,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.934,
      "probP10": 0.934,
      "probP90": 0.934,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.78,
        "near": 0.16,
        "above": 0.06
      },
      "signal": "drought",
      "margin": 0.684,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.345,
      "probP10": 0.34,
      "probP90": 0.34,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.49,
        "near": 0.33,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.095,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.031,
      "probP10": 0.002,
      "probP90": 0.092,
      "ensembleAgreement": 0.02,
      "membersAboveThreshold": 1,
      "membersTotal": 51,
      "terciles": {
        "below": 0.22,
        "near": 0.41,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.219,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.934,
      "probP10": 0.934,
      "probP90": 0.934,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.78,
        "near": 0.16,
        "above": 0.06
      },
      "signal": "drought",
      "margin": 0.684,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.345,
      "probP10": 0.34,
      "probP90": 0.34,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.49,
        "near": 0.33,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.095,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.031,
      "probP10": 0.002,
      "probP90": 0.092,
      "ensembleAgreement": 0.02,
      "membersAboveThreshold": 1,
      "membersTotal": 51,
      "terciles": {
        "below": 0.22,
        "near": 0.41,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.219,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0.934,
      "probP10": 0.934,
      "probP90": 0.934,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.78,
        "near": 0.16,
        "above": 0.06
      },
      "signal": "drought",
      "margin": 0.684,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0.345,
      "probP10": 0.34,
      "probP90": 0.34,
      "ensembleAgreement": 1,
      "membersAboveThreshold": 51,
      "membersTotal": 51,
      "terciles": {
        "below": 0.49,
        "near": 0.33,
        "above": 0.18
      },
      "signal": "watch",
      "margin": 0.095,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0.031,
      "probP10": 0.002,
      "probP90": 0.092,
      "ensembleAgreement": 0.02,
      "membersAboveThreshold": 1,
      "membersTotal": 51,
      "terciles": {
        "below": 0.22,
        "near": 0.41,
        "above": 0.37
      },
      "signal": "normal",
      "margin": -0.219,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 1,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 2,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 11,
      "leadMonths": 3,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    }
  ],
  "verification": null
},
"2026-07": {
  "id": "2026-07",
  "status": "verified",
  "initDate": "2026-07-01",
  "generatedAt": "2026-07-03T07:18:44Z",
  "contentHash": "7a2e9c04d1b8f3557e6a0b2c91d4e8f0a3c7b5d2896e1f4a0d3b6c9e82f5a170",
  "run": {
    "source": "ECMWF SEAS5",
    "ensembleMembers": 51,
    "ensembleReduction": "member_wise",
    "forecastGrib": "seas5_20260701_tp_t2m_51mem.grib2",
    "climatologyGrib": "seas5_clim_1993-2016_07.grib2",
    "codeCommit": "4b81e77",
    "droughtModel": "cascade-gbm v0.4.0",
    "bridgeModel": "bridge-ridge v0.2.0",
    "labelVersion": "vci3m_v1",
    "featureCoverage": 0.79
  },
  "config": {
    "threshold": 0.25,
    "thresholdRationale": "NDMA drought bulletin trigger review, March 2026: P(VCI3M below 20) at 0.25 balances misses against alert fatigue on the 2019-2025 record."
  },
  "forecasts": [
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.071,
      "probP10": 0.064,
      "probP90": 0.08,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.221,
        "near": 0.3,
        "above": 0.479
      },
      "signal": "normal",
      "margin": -0.179,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.118,
      "probP10": 0.106,
      "probP90": 0.132,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.268,
        "near": 0.3,
        "above": 0.432
      },
      "signal": "normal",
      "margin": -0.132,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "turkana",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.221,
      "probP10": 0.199,
      "probP90": 0.248,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.371,
        "near": 0.3,
        "above": 0.329
      },
      "signal": "normal",
      "margin": -0.029,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.071,
      "probP10": 0.064,
      "probP90": 0.08,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.221,
        "near": 0.3,
        "above": 0.479
      },
      "signal": "normal",
      "margin": -0.179,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.118,
      "probP10": 0.106,
      "probP90": 0.132,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.268,
        "near": 0.3,
        "above": 0.432
      },
      "signal": "normal",
      "margin": -0.132,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "marsabit",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.221,
      "probP10": 0.199,
      "probP90": 0.248,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.371,
        "near": 0.3,
        "above": 0.329
      },
      "signal": "normal",
      "margin": -0.029,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "samburu",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.071,
      "probP10": 0.064,
      "probP90": 0.08,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.221,
        "near": 0.3,
        "above": 0.479
      },
      "signal": "normal",
      "margin": -0.179,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.118,
      "probP10": 0.106,
      "probP90": 0.132,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.268,
        "near": 0.3,
        "above": 0.432
      },
      "signal": "normal",
      "margin": -0.132,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "isiolo",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.221,
      "probP10": 0.199,
      "probP90": 0.248,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.371,
        "near": 0.3,
        "above": 0.329
      },
      "signal": "normal",
      "margin": -0.029,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.041,
          "value": -0.8,
          "unit": "SPI"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.028,
          "value": 0.6,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.017,
          "value": 1.2,
          "unit": "degC"
        },
        {
          "feature": "soil_moisture_anom",
          "label": "Soil moisture anomaly",
          "contribution": -0.012,
          "value": 0.4,
          "unit": "sd"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.19,
      "probP10": 0.171,
      "probP90": 0.213,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.34,
        "near": 0.3,
        "above": 0.36
      },
      "signal": "normal",
      "margin": -0.06,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.246,
      "probP10": 0.221,
      "probP90": 0.276,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.396,
        "near": 0.3,
        "above": 0.304
      },
      "signal": "normal",
      "margin": -0.004,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "wajir",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.385,
      "probP10": 0.347,
      "probP90": 0.431,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.535,
        "near": 0.3,
        "above": 0.165
      },
      "signal": "watch",
      "margin": 0.135,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.19,
      "probP10": 0.171,
      "probP90": 0.213,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.34,
        "near": 0.3,
        "above": 0.36
      },
      "signal": "normal",
      "margin": -0.06,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.246,
      "probP10": 0.221,
      "probP90": 0.276,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.396,
        "near": 0.3,
        "above": 0.304
      },
      "signal": "normal",
      "margin": -0.004,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "mandera",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.385,
      "probP10": 0.347,
      "probP90": 0.431,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.535,
        "near": 0.3,
        "above": 0.165
      },
      "signal": "watch",
      "margin": 0.135,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.19,
      "probP10": 0.171,
      "probP90": 0.213,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.34,
        "near": 0.3,
        "above": 0.36
      },
      "signal": "normal",
      "margin": -0.06,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.246,
      "probP10": 0.221,
      "probP90": 0.276,
      "ensembleAgreement": 0.196,
      "membersAboveThreshold": 10,
      "membersTotal": 51,
      "terciles": {
        "below": 0.396,
        "near": 0.3,
        "above": 0.304
      },
      "signal": "normal",
      "margin": -0.004,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "garissa",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.385,
      "probP10": 0.347,
      "probP90": 0.431,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.535,
        "near": 0.3,
        "above": 0.165
      },
      "signal": "watch",
      "margin": 0.135,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.088,
          "value": -1.3,
          "unit": "SPI"
        },
        {
          "feature": "iod_dmi",
          "label": "IOD, Dipole Mode Index",
          "contribution": -0.034,
          "value": 0.3,
          "unit": "degC"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.026,
          "value": 1.7,
          "unit": "degC"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.019,
          "value": -0.11,
          "unit": "NDVI"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.612,
      "probP10": 0.551,
      "probP90": 0.685,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.762,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.362,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.871,
      "probP10": 0.784,
      "probP90": 0.976,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.85,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.621,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "kitui",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.298,
      "probP10": 0.268,
      "probP90": 0.334,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.448,
        "near": 0.3,
        "above": 0.252
      },
      "signal": "watch",
      "margin": 0.048,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.612,
      "probP10": 0.551,
      "probP90": 0.685,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.762,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.362,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.871,
      "probP10": 0.784,
      "probP90": 0.976,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.85,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.621,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "makueni",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.298,
      "probP10": 0.268,
      "probP90": 0.334,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.448,
        "near": 0.3,
        "above": 0.252
      },
      "signal": "watch",
      "margin": 0.048,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0.612,
      "probP10": 0.551,
      "probP90": 0.685,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.762,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.362,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0.871,
      "probP10": 0.784,
      "probP90": 0.976,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.85,
        "near": 0.3,
        "above": 0.05
      },
      "signal": "drought",
      "margin": 0.621,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "machakos",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0.298,
      "probP10": 0.268,
      "probP90": 0.334,
      "ensembleAgreement": 0.706,
      "membersAboveThreshold": 36,
      "membersTotal": 51,
      "terciles": {
        "below": 0.448,
        "near": 0.3,
        "above": 0.252
      },
      "signal": "watch",
      "margin": 0.048,
      "drivers": [
        {
          "feature": "era5_spi3",
          "label": "Rainfall deficit, 3 month",
          "contribution": 0.214,
          "value": -1.9,
          "unit": "SPI"
        },
        {
          "feature": "ndvi_anom",
          "label": "NDVI anomaly",
          "contribution": 0.102,
          "value": -0.19,
          "unit": "NDVI"
        },
        {
          "feature": "era5_lst_anom",
          "label": "Land temp anomaly",
          "contribution": 0.067,
          "value": 2.4,
          "unit": "degC"
        },
        {
          "feature": "nino34",
          "label": "ENSO state, Nino3.4",
          "contribution": 0.031,
          "value": 0.6,
          "unit": "degC"
        }
      ]
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 8,
      "leadMonths": 1,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 9,
      "leadMonths": 2,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    },
    {
      "countyId": "tharaka_nithi",
      "validYear": 2026,
      "validMonth": 10,
      "leadMonths": 3,
      "droughtProb": 0,
      "probP10": null,
      "probP90": null,
      "ensembleAgreement": null,
      "membersAboveThreshold": null,
      "membersTotal": null,
      "terciles": null,
      "signal": "no_coverage",
      "margin": 0,
      "drivers": null
    }
  ],
  "verification": {
    "verifiedAt": "2026-09-06T05:30:00Z",
    "truthSource": "vci3m_v1",
    "brier": 0.158,
    "brierSkillScore": 0.071,
    "rocAuc": 0.66,
    "hits": 2,
    "misses": 1,
    "falseAlarms": 1,
    "correctNegatives": 5,
    "perCounty": [
      {
        "countyId": "turkana",
        "predicted": 0.071,
        "observed": 0,
        "brier": 0.005
      },
      {
        "countyId": "marsabit",
        "predicted": 0.071,
        "observed": 0,
        "brier": 0.005
      },
      {
        "countyId": "isiolo",
        "predicted": 0.071,
        "observed": 0,
        "brier": 0.005
      },
      {
        "countyId": "wajir",
        "predicted": 0.19,
        "observed": 0,
        "brier": 0.036
      },
      {
        "countyId": "mandera",
        "predicted": 0.19,
        "observed": 0,
        "brier": 0.036
      },
      {
        "countyId": "garissa",
        "predicted": 0.19,
        "observed": 1,
        "brier": 0.656
      },
      {
        "countyId": "kitui",
        "predicted": 0.612,
        "observed": 1,
        "brier": 0.151
      },
      {
        "countyId": "makueni",
        "predicted": 0.612,
        "observed": 1,
        "brier": 0.151
      },
      {
        "countyId": "machakos",
        "predicted": 0.612,
        "observed": 0,
        "brier": 0.375
      }
    ]
  }
}
},
layers: [
  {
    "id": "prob",
    "group": "forecast",
    "label": "Drought probability",
    "unit": "P",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.1,
      0.25,
      0.4,
      0.6
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/prob/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": true
  },
  {
    "id": "agreement",
    "group": "forecast",
    "label": "Ensemble agreement",
    "unit": "share",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.2,
      0.4,
      0.6,
      0.8
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/agreement/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "p10",
    "group": "forecast",
    "label": "Probability p10",
    "unit": "P",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.1,
      0.25,
      0.4,
      0.6
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/p10/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "p90",
    "group": "forecast",
    "label": "Probability p90",
    "unit": "P",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.1,
      0.25,
      0.4,
      0.6
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/p90/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "tercile_below",
    "group": "forecast",
    "label": "Tercile below-normal",
    "unit": "P",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.33,
      0.45,
      0.6,
      0.75
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/tercile_below/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": true
  },
  {
    "id": "vci3m",
    "group": "observed",
    "label": "VCI3M",
    "unit": "VCI",
    "domain": [
      0,
      100
    ],
    "classBreaks": [
      10,
      20,
      35,
      50
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/vci3m/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": false
  },
  {
    "id": "ndvi",
    "group": "observed",
    "label": "NDVI",
    "unit": "NDVI",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.2,
      0.35,
      0.5,
      0.65
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/ndvi/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "ndvi_anom",
    "group": "observed",
    "label": "NDVI anomaly",
    "unit": "dNDVI",
    "domain": [
      -0.3,
      0.3
    ],
    "classBreaks": [
      -0.15,
      -0.05,
      0.05,
      0.15
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/ndvi_anom/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "chirps_precip",
    "group": "observed",
    "label": "CHIRPS rainfall",
    "unit": "mm",
    "domain": [
      0,
      300
    ],
    "classBreaks": [
      30,
      80,
      150,
      220
    ],
    "colourRamp": [
      "#39474F",
      "#3E6B7A",
      "#4C93A6",
      "#63BDC9",
      "#8FE3DD"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/chirps_precip/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "rain_anom",
    "group": "observed",
    "label": "Rainfall anomaly",
    "unit": "%",
    "domain": [
      -80,
      80
    ],
    "classBreaks": [
      -40,
      -15,
      15,
      40
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/rain_anom/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "spi3",
    "group": "observed",
    "label": "SPI-3",
    "unit": "SPI",
    "domain": [
      -3,
      3
    ],
    "classBreaks": [
      -2,
      -1,
      0,
      1
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/spi3/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "spi6",
    "group": "observed",
    "label": "SPI-6",
    "unit": "SPI",
    "domain": [
      -3,
      3
    ],
    "classBreaks": [
      -2,
      -1,
      0,
      1
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/spi6/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "lst_day",
    "group": "observed",
    "label": "LST day",
    "unit": "degC",
    "domain": [
      15,
      50
    ],
    "classBreaks": [
      25,
      32,
      38,
      44
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/lst_day/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "lst_anom",
    "group": "observed",
    "label": "LST anomaly",
    "unit": "degC",
    "domain": [
      -5,
      5
    ],
    "classBreaks": [
      -2,
      -0.5,
      0.5,
      2
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/lst_anom/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "soil_moisture",
    "group": "observed",
    "label": "Soil moisture",
    "unit": "% vol",
    "domain": [
      0,
      45
    ],
    "classBreaks": [
      8,
      15,
      25,
      35
    ],
    "colourRamp": [
      "#39474F",
      "#3E6B7A",
      "#4C93A6",
      "#63BDC9",
      "#8FE3DD"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/soil_moisture/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "bridge_rain",
    "group": "bridge",
    "label": "Predicted rainfall",
    "unit": "mm",
    "domain": [
      0,
      300
    ],
    "classBreaks": [
      30,
      80,
      150,
      220
    ],
    "colourRamp": [
      "#39474F",
      "#3E6B7A",
      "#4C93A6",
      "#63BDC9",
      "#8FE3DD"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/bridge_rain/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "bridge_ndvi",
    "group": "bridge",
    "label": "Predicted NDVI",
    "unit": "NDVI",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.2,
      0.35,
      0.5,
      0.65
    ],
    "colourRamp": [
      "#B24A2C",
      "#C97A3C",
      "#D9A84E",
      "#8FA96A",
      "#4FA987"
    ],
    "reversed": true,
    "tileUrl": "/v1/tiles/bridge_ndvi/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "bridge_lst",
    "group": "bridge",
    "label": "Predicted LST",
    "unit": "degC",
    "domain": [
      15,
      50
    ],
    "classBreaks": [
      25,
      32,
      38,
      44
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/bridge_lst/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "fc_minus_obs",
    "group": "error",
    "label": "Forecast minus observed",
    "unit": "dP",
    "domain": [
      -1,
      1
    ],
    "classBreaks": [
      -0.5,
      -0.15,
      0.15,
      0.5
    ],
    "colourRamp": [
      "#4C93A6",
      "#7FBFB9",
      "#39474F",
      "#C98A5A",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/fc_minus_obs/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "abs_error",
    "group": "error",
    "label": "Absolute error",
    "unit": "dP",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.1,
      0.2,
      0.35,
      0.5
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/abs_error/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "brier_contrib",
    "group": "error",
    "label": "Brier contribution",
    "unit": "B",
    "domain": [
      0,
      1
    ],
    "classBreaks": [
      0.05,
      0.15,
      0.3,
      0.5
    ],
    "colourRamp": [
      "#4FA987",
      "#8FA96A",
      "#D9A84E",
      "#C97A3C",
      "#B24A2C"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/brier_contrib/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": true
  },
  {
    "id": "county_bounds",
    "group": "context",
    "label": "County boundaries",
    "unit": "",
    "domain": [
      0,
      1
    ],
    "classBreaks": [],
    "colourRamp": [
      "#26333B"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/county_bounds/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": false
  },
  {
    "id": "livelihood_zones",
    "group": "context",
    "label": "Livelihood zones",
    "unit": "",
    "domain": [
      0,
      1
    ],
    "classBreaks": [],
    "colourRamp": [
      "#4FA987",
      "#D9A84E",
      "#4C93A6",
      "#8F7AB2"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/livelihood_zones/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": false
  },
  {
    "id": "water_points",
    "group": "context",
    "label": "Water points",
    "unit": "",
    "domain": [
      0,
      1
    ],
    "classBreaks": [],
    "colourRamp": [
      "#63BDC9"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/water_points/{issue}/{z}/{x}/{y}.png",
    "legendKind": "classed",
    "sourceIssueRequired": false
  },
  {
    "id": "population",
    "group": "context",
    "label": "Population",
    "unit": "per km2",
    "domain": [
      0,
      250
    ],
    "classBreaks": [
      5,
      25,
      80,
      160
    ],
    "colourRamp": [
      "#39474F",
      "#4C5E6B",
      "#6B7F8C",
      "#93A6B0",
      "#C4D1D6"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/population/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  },
  {
    "id": "soil_moisture_50",
    "group": "observed",
    "label": "Soil moisture, 50 cm",
    "unit": "% vol",
    "domain": [
      0,
      45
    ],
    "classBreaks": [
      8,
      15,
      25,
      35
    ],
    "colourRamp": [
      "#39474F",
      "#3E6B7A",
      "#4C93A6",
      "#63BDC9",
      "#8FE3DD"
    ],
    "reversed": false,
    "tileUrl": "/v1/tiles/soil_moisture_50/{issue}/{z}/{x}/{y}.png",
    "legendKind": "continuous",
    "sourceIssueRequired": false
  }
],
series: {"turkana":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.17,0.115,0.155,0.195,0.227,0.356,0.288,0.259,0.32,0.171,0.127,0.209,0.164,0.178,0.215,0.234,0.313,0.353,0.321,0.268,0.246,0.093,0.243,0.337],"p10":[0.11,0.027,0.111,0.088,0.172,0.249,0.24,0.163,0.246,0.11,0.056,0.142,0.128,0.107,0.13,0.185,0.205,0.309,0.229,0.224,0.137,0.086,0.212,0.28],"p90":[0.231,0.203,0.198,0.303,0.282,0.462,0.337,0.356,0.393,0.231,0.198,0.276,0.201,0.25,0.3,0.282,0.422,0.397,0.413,0.312,0.355,0.094,0.255,0.397],"vci3m":[54.3,55.2,46.8,42.7,38.9,35,35.5,35.5,39.8,42.2,45.3,49.3,45.3,51.7,48.2,37.9,38.6,36.6,29.6,34.8,32.8,38.4,37.6,31.4],"rain_anom":[-10,-8,-8,-21,-8,-27,-29,-14,-11,-13,-5,1,-1,-2,-4,-20,-22,-29,-11,-19,-12,-18,0,-18],"lst_anom":[1.4,1.7,1,0.8,1.1,0.5,0.2,0.8,0.5,0.8,1.5,1.2,1.6,1.4,0.9,0.8,0.6,0.3,0.4,0.5,0.4,1,1,1.2]},"latest":{"probDelta":{"2026-09":-0.025,"2026-10":0.022,"2026-11":null},"vci3m":{"value":31.4,"delta":-4.2},"rainAnom":{"value":-18},"lstAnom":{"value":1.2}}},"marsabit":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.146,0.19,0.164,0.245,0.316,0.323,0.365,0.314,0.277,0.279,0.135,0.125,0.17,0.159,0.131,0.259,0.24,0.349,0.31,0.362,0.315,0.093,0.243,0.337],"p10":[0.057,0.139,0.069,0.17,0.267,0.226,0.279,0.238,0.18,0.201,0.075,0.061,0.078,0.071,0.099,0.2,0.172,0.288,0.24,0.256,0.269,0.086,0.212,0.28],"p90":[0.235,0.242,0.258,0.321,0.364,0.419,0.451,0.389,0.374,0.358,0.195,0.189,0.262,0.248,0.162,0.318,0.309,0.409,0.379,0.469,0.362,0.094,0.255,0.397],"vci3m":[57.9,56.3,49.7,44.4,45.5,41.7,37.5,36.1,38.9,49.2,45.5,54.5,55.6,55.6,50.6,47.7,35.3,36.1,30.5,33.1,42,44.5,46.1,34.8],"rain_anom":[-14,2,1,-18,-10,-15,-6,-16,-3,-11,-3,1,7,4,1,-2,-11,-6,-12,-19,-8,-19,-17,-12],"lst_anom":[1,1.4,1.2,0.5,0.6,0.6,0.6,0.2,0.9,0.5,0.9,1.3,0.7,0.7,1.1,1.1,0.5,0,0.6,0.7,0.6,0.5,0.7,0.9]},"latest":{"probDelta":{"2026-09":-0.025,"2026-10":0.022,"2026-11":null},"vci3m":{"value":34.8,"delta":-2.1},"rainAnom":{"value":-12},"lstAnom":{"value":0.9}}},"samburu":null,"isiolo":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.127,0.169,0.148,0.191,0.28,0.332,0.354,0.258,0.279,0.268,0.146,0.104,0.176,0.13,0.195,0.195,0.246,0.322,0.26,0.259,0.317,0.093,0.243,0.337],"p10":[0.048,0.117,0.06,0.121,0.224,0.265,0.271,0.202,0.229,0.237,0.08,0.064,0.118,0.098,0.115,0.155,0.176,0.261,0.211,0.195,0.264,0.086,0.212,0.28],"p90":[0.207,0.22,0.236,0.261,0.336,0.399,0.437,0.314,0.329,0.299,0.212,0.143,0.234,0.161,0.274,0.236,0.315,0.384,0.31,0.324,0.37,0.094,0.255,0.397],"vci3m":[57.2,56.3,52.8,50.8,41.9,42.6,43.5,38.5,43.3,48.8,52.3,55.3,58.5,52.6,49,50.3,37.9,38.3,38.4,39.3,39.9,46.5,48.4,37.2],"rain_anom":[-10,7,-3,-3,-13,-1,-11,0,-1,-13,1,-7,-1,-10,1,-9,-15,-17,-5,-3,-19,0,-15,-9],"lst_anom":[0.5,0.4,0.7,0.5,0.4,0.3,0,0.5,0.6,0.7,1,1,0.6,0.7,0.9,0.4,0.4,0,0.4,0.4,0.8,0.2,0.9,0.7]},"latest":{"probDelta":{"2026-09":-0.025,"2026-10":0.022,"2026-11":null},"vci3m":{"value":37.2,"delta":-1.4},"rainAnom":{"value":-9},"lstAnom":{"value":0.7}}},"wajir":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.155,0.182,0.243,0.278,0.286,0.323,0.351,0.333,0.346,0.262,0.253,0.234,0.241,0.166,0.288,0.31,0.383,0.318,0.411,0.394,0.382,0.284,0.426,0.005],"p10":[0.113,0.085,0.196,0.209,0.207,0.277,0.309,0.226,0.239,0.156,0.158,0.184,0.185,0.106,0.187,0.249,0.347,0.238,0.358,0.313,0.341,0.284,0.016,0.002],"p90":[0.197,0.278,0.291,0.346,0.365,0.368,0.393,0.44,0.453,0.369,0.349,0.284,0.298,0.226,0.389,0.371,0.42,0.398,0.465,0.475,0.424,0.284,0.606,0.006],"vci3m":[44.6,48.9,38.2,39.7,30.7,32.5,29.1,24.8,33,37.1,40.6,44.8,46.1,37.6,33.9,35.1,26.9,24.7,25.7,27.7,29.5,34.3,31.5,24.6],"rain_anom":[-18,-4,-13,-20,-27,-27,-48,-30,-27,-18,-14,-21,2,-20,-7,-31,-22,-38,-35,-39,-37,-14,-19,-31],"lst_anom":[1.7,1.8,1.4,1.3,0.6,1.1,0.6,1,1.3,1.5,1.8,1.8,1.8,2.1,1.8,1.6,0.8,0.8,0.8,0.4,0.6,1.3,1.5,1.7]},"latest":{"probDelta":{"2026-09":0.038,"2026-10":0.041,"2026-11":null},"vci3m":{"value":24.6,"delta":-6.8},"rainAnom":{"value":-31},"lstAnom":{"value":1.7}}},"mandera":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.184,0.188,0.283,0.334,0.343,0.3,0.357,0.418,0.385,0.237,0.224,0.208,0.195,0.221,0.236,0.264,0.379,0.392,0.413,0.375,0.316,0.284,0.426,0.005],"p10":[0.122,0.129,0.194,0.291,0.258,0.19,0.258,0.344,0.305,0.199,0.161,0.166,0.147,0.173,0.192,0.218,0.341,0.338,0.311,0.296,0.236,0.284,0.016,0.002],"p90":[0.245,0.248,0.372,0.378,0.428,0.409,0.456,0.491,0.465,0.274,0.287,0.251,0.243,0.269,0.279,0.31,0.418,0.446,0.516,0.455,0.396,0.284,0.606,0.006],"vci3m":[46.1,38.9,41.5,38.4,29.8,29.1,29.7,29.2,25.9,29.1,36.3,40.8,36.5,36.4,35,27.7,30.3,26.5,21.7,24.8,29,31.6,30,22.1],"rain_anom":[-17,-10,-21,-20,-33,-49,-34,-35,-39,-27,-26,-7,-11,-15,-19,-17,-30,-46,-52,-31,-34,-31,-11,-35],"lst_anom":[2.4,2.4,1.9,1.8,0.9,0.7,0.9,0.9,0.9,1.8,2.3,2.5,2.3,2,1.5,1.6,1.4,1.2,1.2,1,0.8,1.5,1.7,1.9]},"latest":{"probDelta":{"2026-09":0.038,"2026-10":0.041,"2026-11":null},"vci3m":{"value":22.1,"delta":-7.9},"rainAnom":{"value":-35},"lstAnom":{"value":1.9}}},"garissa":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.19,0.206,0.262,0.328,0.313,0.361,0.311,0.299,0.277,0.3,0.225,0.212,0.232,0.2,0.185,0.262,0.317,0.381,0.335,0.326,0.301,0.284,0.426,0.005],"p10":[0.16,0.123,0.227,0.25,0.262,0.276,0.27,0.269,0.241,0.223,0.133,0.155,0.144,0.137,0.125,0.212,0.226,0.305,0.238,0.277,0.203,0.284,0.016,0.002],"p90":[0.22,0.288,0.298,0.406,0.364,0.445,0.352,0.329,0.313,0.377,0.317,0.268,0.321,0.263,0.246,0.312,0.408,0.458,0.433,0.375,0.398,0.284,0.606,0.006],"vci3m":[47.5,48.3,41.6,42.8,35.7,33,26.6,35.3,34.6,35,39,45.3,46.8,43.6,38.1,34.4,28.1,30.2,30,24.4,26.4,34.8,40.2,26.9],"rain_anom":[-16,-12,-8,-28,-38,-23,-36,-35,-18,-31,-19,-2,-2,-4,-22,-23,-17,-35,-38,-29,-33,-29,-23,-28],"lst_anom":[1.5,1.3,1.5,1.2,0.7,1.1,0.8,1,0.9,1.4,1.6,1.4,1.7,2,1.5,1.3,1.1,0.9,0.5,0.9,1.2,0.8,1.3,1.5]},"latest":{"probDelta":{"2026-09":0.038,"2026-10":0.041,"2026-11":null},"vci3m":{"value":26.9,"delta":-5.5},"rainAnom":{"value":-28},"lstAnom":{"value":1.5}}},"kitui":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.339,0.324,0.351,0.352,0.436,0.4,0.429,0.446,0.366,0.318,0.291,0.319,0.236,0.268,0.362,0.362,0.359,0.435,0.485,0.466,0.44,0.934,0.345,0.031],"p10":[0.245,0.261,0.299,0.263,0.4,0.31,0.371,0.395,0.296,0.221,0.203,0.273,0.179,0.178,0.33,0.301,0.311,0.404,0.453,0.401,0.39,0.934,0.34,0.002],"p90":[0.433,0.387,0.402,0.441,0.471,0.489,0.487,0.496,0.435,0.414,0.379,0.366,0.294,0.358,0.394,0.423,0.407,0.467,0.518,0.532,0.49,0.934,0.34,0.092],"vci3m":[35.3,36.8,34.2,27.1,26.3,22.5,22.1,18,26.4,24,35.6,35.8,38.3,29.5,25.9,23,17.5,19.1,20.3,17.1,20.3,23.1,30.6,16.8],"rain_anom":[-12,-21,-13,-20,-47,-40,-44,-44,-32,-18,-10,-10,-3,-6,-28,-31,-38,-42,-50,-46,-32,-22,-12,-38],"lst_anom":[3.3,2.8,2.1,2.2,1.4,1.3,1,1.1,1.6,1.7,2.5,2.4,3,2.9,2.1,1.9,1.2,1.2,1.3,0.8,1.3,2,2.1,2.4]},"latest":{"probDelta":{"2026-09":0.063,"2026-10":0.047,"2026-11":null},"vci3m":{"value":16.8,"delta":-9.3},"rainAnom":{"value":-38},"lstAnom":{"value":2.4}}},"makueni":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.311,0.268,0.309,0.362,0.456,0.486,0.505,0.484,0.442,0.428,0.362,0.271,0.318,0.242,0.316,0.411,0.468,0.424,0.464,0.431,0.468,0.934,0.345,0.031],"p10":[0.261,0.17,0.275,0.308,0.353,0.447,0.409,0.452,0.391,0.379,0.322,0.216,0.282,0.139,0.225,0.337,0.421,0.378,0.433,0.394,0.374,0.934,0.34,0.002],"p90":[0.362,0.366,0.343,0.416,0.559,0.525,0.601,0.516,0.492,0.478,0.403,0.326,0.353,0.345,0.407,0.485,0.515,0.471,0.495,0.467,0.561,0.934,0.34,0.092],"vci3m":[39.3,42.8,33,26.9,23.7,24,20.3,24.8,29,29.9,32.9,37.1,35.6,38.5,32.7,25.4,19.9,20.3,19.4,22.4,22.8,27.3,33.1,18.4],"rain_anom":[-7,-20,-15,-19,-33,-35,-46,-38,-40,-18,-15,-22,-20,-18,-18,-29,-24,-41,-37,-34,-29,-24,-20,-34],"lst_anom":[2.5,2.3,2.2,1.8,0.9,0.6,1.2,1.1,1.4,1.7,1.8,2.3,2.2,2.7,2.2,1.4,0.9,0.9,1.1,1,1.5,1.5,2.2,2.1]},"latest":{"probDelta":{"2026-09":0.063,"2026-10":0.047,"2026-11":null},"vci3m":{"value":18.4,"delta":-8.1},"rainAnom":{"value":-34},"lstAnom":{"value":2.1}}},"machakos":{"t":["2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"],"series":{"prob":[0.308,0.26,0.375,0.396,0.388,0.421,0.419,0.423,0.468,0.332,0.32,0.251,0.237,0.328,0.368,0.423,0.376,0.438,0.47,0.429,0.4,0.934,0.345,0.031],"p10":[0.251,0.191,0.313,0.331,0.278,0.378,0.316,0.349,0.405,0.238,0.264,0.217,0.155,0.283,0.287,0.383,0.276,0.352,0.431,0.393,0.299,0.934,0.34,0.002],"p90":[0.365,0.33,0.438,0.461,0.497,0.464,0.521,0.498,0.531,0.426,0.377,0.285,0.319,0.374,0.448,0.462,0.476,0.524,0.509,0.465,0.501,0.934,0.34,0.092],"vci3m":[39.9,42.2,42.8,33.3,29.2,28.7,28.7,26.2,29.6,29.4,38,35.5,35.4,35.2,36.9,27.4,23.7,19.1,21.9,19.1,25.5,25,32,21.7],"rain_anom":[-15,-11,-18,-25,-34,-19,-38,-33,-23,-10,-23,-12,-9,-7,-16,-23,-21,-20,-26,-31,-23,-13,-12,-26],"lst_anom":[2.2,1.8,1.6,1.7,0.7,1,0.6,0.5,1.3,1.6,1.6,2.5,2.1,1.7,1.8,1.1,0.7,0.5,0.6,0.9,0.7,1.8,1.5,1.8]},"latest":{"probDelta":{"2026-09":0.063,"2026-10":0.047,"2026-11":null},"vci3m":{"value":21.7,"delta":-6.2},"rainAnom":{"value":-26},"lstAnom":{"value":1.8}}},"tharaka_nithi":null},
stations: [
  {
    "id": "st-001",
    "name": "Lodwar Water Point",
    "kind": "water_point",
    "countyId": "turkana",
    "coords": [
      35.274,
      4.129
    ],
    "installedAt": "2021-04-18",
    "lastReadingAt": "2026-08-11T05:00:00Z",
    "active": true,
    "signalPct": 87,
    "batteryPct": 55,
    "freshnessPct": 86,
    "status": "reporting"
  },
  {
    "id": "st-002",
    "name": "Kakuma Observer Post",
    "kind": "observer",
    "countyId": "turkana",
    "coords": [
      35.761,
      2.652
    ],
    "installedAt": "2022-08-01",
    "lastReadingAt": "2026-08-10T22:00:00Z",
    "active": true,
    "signalPct": 63,
    "batteryPct": null,
    "freshnessPct": 97,
    "status": "reporting"
  },
  {
    "id": "st-003",
    "name": "Lokichar Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "turkana",
    "coords": [
      35.51,
      1.907
    ],
    "installedAt": "2018-10-15",
    "lastReadingAt": "2026-08-11T07:00:00Z",
    "active": true,
    "signalPct": 37,
    "batteryPct": 33,
    "freshnessPct": 97,
    "status": "reporting"
  },
  {
    "id": "st-004",
    "name": "Kalokol AWS",
    "kind": "weather",
    "countyId": "turkana",
    "coords": [
      35.865,
      2.686
    ],
    "installedAt": "2017-07-17",
    "lastReadingAt": "2026-08-11T08:00:00Z",
    "active": true,
    "signalPct": 50,
    "batteryPct": 68,
    "freshnessPct": 86,
    "status": "reporting"
  },
  {
    "id": "st-005",
    "name": "Lokitaung Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "turkana",
    "coords": [
      35.749,
      4.146
    ],
    "installedAt": "2019-04-03",
    "lastReadingAt": "2026-08-11T04:00:00Z",
    "active": true,
    "signalPct": 75,
    "batteryPct": 71,
    "freshnessPct": 94,
    "status": "reporting"
  },
  {
    "id": "st-006",
    "name": "Marsabit Town Observer Post",
    "kind": "observer",
    "countyId": "marsabit",
    "coords": [
      36.883,
      3.711
    ],
    "installedAt": "2018-02-01",
    "lastReadingAt": "2026-08-10T14:00:00Z",
    "active": true,
    "signalPct": 57,
    "batteryPct": null,
    "freshnessPct": 91,
    "status": "reporting"
  },
  {
    "id": "st-007",
    "name": "Moyale Water Point",
    "kind": "water_point",
    "countyId": "marsabit",
    "coords": [
      38.489,
      2.051
    ],
    "installedAt": "2019-09-06",
    "lastReadingAt": "2026-08-02T08:00:00Z",
    "active": true,
    "signalPct": 66,
    "batteryPct": 82,
    "freshnessPct": 40,
    "status": "stale"
  },
  {
    "id": "st-008",
    "name": "Loiyangalani Observer Post",
    "kind": "observer",
    "countyId": "marsabit",
    "coords": [
      37.823,
      3.658
    ],
    "installedAt": "2019-08-10",
    "lastReadingAt": "2026-08-10T21:00:00Z",
    "active": true,
    "signalPct": 79,
    "batteryPct": null,
    "freshnessPct": 87,
    "status": "reporting"
  },
  {
    "id": "st-009",
    "name": "North Horr AWS",
    "kind": "weather",
    "countyId": "marsabit",
    "coords": [
      38.377,
      3.234
    ],
    "installedAt": "2021-04-03",
    "lastReadingAt": "2026-06-13T08:00:00Z",
    "active": false,
    "signalPct": null,
    "batteryPct": null,
    "freshnessPct": 17,
    "status": "offline"
  },
  {
    "id": "st-010",
    "name": "Maralal Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "samburu",
    "coords": [
      37.492,
      2.015
    ],
    "installedAt": "2023-02-28",
    "lastReadingAt": "2026-08-10T23:00:00Z",
    "active": true,
    "signalPct": 46,
    "batteryPct": 73,
    "freshnessPct": 95,
    "status": "reporting"
  },
  {
    "id": "st-011",
    "name": "Baragoi Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "samburu",
    "coords": [
      37.09,
      1.147
    ],
    "installedAt": "2018-08-25",
    "lastReadingAt": "2026-08-11T02:00:00Z",
    "active": true,
    "signalPct": 55,
    "batteryPct": 79,
    "freshnessPct": 89,
    "status": "reporting"
  },
  {
    "id": "st-012",
    "name": "Wamba Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "samburu",
    "coords": [
      37.575,
      1.388
    ],
    "installedAt": "2022-11-26",
    "lastReadingAt": "2026-08-10T18:00:00Z",
    "active": true,
    "signalPct": 48,
    "batteryPct": 65,
    "freshnessPct": 91,
    "status": "reporting"
  },
  {
    "id": "st-013",
    "name": "Isiolo Town Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "isiolo",
    "coords": [
      37.458,
      1.276
    ],
    "installedAt": "2019-05-01",
    "lastReadingAt": "2026-08-07T16:00:00Z",
    "active": true,
    "signalPct": 48,
    "batteryPct": 95,
    "freshnessPct": 58,
    "status": "stale"
  },
  {
    "id": "st-014",
    "name": "Merti Observer Post",
    "kind": "observer",
    "countyId": "isiolo",
    "coords": [
      37.639,
      0.576
    ],
    "installedAt": "2020-06-12",
    "lastReadingAt": "2026-08-11T03:00:00Z",
    "active": true,
    "signalPct": 76,
    "batteryPct": null,
    "freshnessPct": 89,
    "status": "reporting"
  },
  {
    "id": "st-015",
    "name": "Garbatulla Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "isiolo",
    "coords": [
      38.779,
      0.781
    ],
    "installedAt": "2021-08-07",
    "lastReadingAt": "2026-08-10T20:00:00Z",
    "active": true,
    "signalPct": 55,
    "batteryPct": 42,
    "freshnessPct": 88,
    "status": "reporting"
  },
  {
    "id": "st-016",
    "name": "Wajir Town Water Point",
    "kind": "water_point",
    "countyId": "wajir",
    "coords": [
      39.588,
      1.235
    ],
    "installedAt": "2017-04-02",
    "lastReadingAt": "2026-08-07T12:00:00Z",
    "active": true,
    "signalPct": 70,
    "batteryPct": 36,
    "freshnessPct": 54,
    "status": "stale"
  },
  {
    "id": "st-017",
    "name": "Eldas AWS",
    "kind": "weather",
    "countyId": "wajir",
    "coords": [
      40.208,
      2.789
    ],
    "installedAt": "2018-11-15",
    "lastReadingAt": "2026-08-06T11:00:00Z",
    "active": true,
    "signalPct": 85,
    "batteryPct": 87,
    "freshnessPct": 53,
    "status": "stale"
  },
  {
    "id": "st-018",
    "name": "Habaswein Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "wajir",
    "coords": [
      40.091,
      2.569
    ],
    "installedAt": "2021-12-14",
    "lastReadingAt": "2026-08-11T01:00:00Z",
    "active": true,
    "signalPct": 87,
    "batteryPct": 83,
    "freshnessPct": 95,
    "status": "reporting"
  },
  {
    "id": "st-019",
    "name": "Tarbaj Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "wajir",
    "coords": [
      39.397,
      1.235
    ],
    "installedAt": "2023-12-23",
    "lastReadingAt": "2026-08-10T19:00:00Z",
    "active": true,
    "signalPct": 73,
    "batteryPct": 83,
    "freshnessPct": 97,
    "status": "reporting"
  },
  {
    "id": "st-020",
    "name": "Mandera Town Water Point",
    "kind": "water_point",
    "countyId": "mandera",
    "coords": [
      40.65,
      3.162
    ],
    "installedAt": "2019-12-18",
    "lastReadingAt": "2026-08-04T10:00:00Z",
    "active": true,
    "signalPct": 55,
    "batteryPct": 83,
    "freshnessPct": 41,
    "status": "stale"
  },
  {
    "id": "st-021",
    "name": "Banissa AWS",
    "kind": "weather",
    "countyId": "mandera",
    "coords": [
      40.227,
      2.706
    ],
    "installedAt": "2024-11-14",
    "lastReadingAt": "2026-08-10T18:00:00Z",
    "active": true,
    "signalPct": 77,
    "batteryPct": 31,
    "freshnessPct": 87,
    "status": "reporting"
  },
  {
    "id": "st-022",
    "name": "Elwak Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "mandera",
    "coords": [
      40.262,
      2.965
    ],
    "installedAt": "2022-10-22",
    "lastReadingAt": "2026-08-10T21:00:00Z",
    "active": true,
    "signalPct": 47,
    "batteryPct": 70,
    "freshnessPct": 91,
    "status": "reporting"
  },
  {
    "id": "st-023",
    "name": "Lafey AWS",
    "kind": "weather",
    "countyId": "mandera",
    "coords": [
      40.801,
      3.178
    ],
    "installedAt": "2019-02-15",
    "lastReadingAt": "2026-08-11T02:00:00Z",
    "active": true,
    "signalPct": 51,
    "batteryPct": 60,
    "freshnessPct": 92,
    "status": "reporting"
  },
  {
    "id": "st-024",
    "name": "Garissa Town Water Point",
    "kind": "water_point",
    "countyId": "garissa",
    "coords": [
      40.003,
      -1.182
    ],
    "installedAt": "2024-01-25",
    "lastReadingAt": "2026-08-11T06:00:00Z",
    "active": true,
    "signalPct": 61,
    "batteryPct": 58,
    "freshnessPct": 84,
    "status": "reporting"
  },
  {
    "id": "st-025",
    "name": "Dadaab Market Monitor",
    "kind": "market",
    "countyId": "garissa",
    "coords": [
      39.341,
      -0.754
    ],
    "installedAt": "2021-02-28",
    "lastReadingAt": "2026-08-10T18:00:00Z",
    "active": true,
    "signalPct": 80,
    "batteryPct": 70,
    "freshnessPct": 96,
    "status": "reporting"
  },
  {
    "id": "st-026",
    "name": "Balambala AWS",
    "kind": "weather",
    "countyId": "garissa",
    "coords": [
      40.642,
      -0.47
    ],
    "installedAt": "2017-01-08",
    "lastReadingAt": "2026-08-11T07:00:00Z",
    "active": true,
    "signalPct": 75,
    "batteryPct": 70,
    "freshnessPct": 92,
    "status": "reporting"
  },
  {
    "id": "st-027",
    "name": "Masalani Observer Post",
    "kind": "observer",
    "countyId": "garissa",
    "coords": [
      39.28,
      -0.707
    ],
    "installedAt": "2023-07-06",
    "lastReadingAt": "2026-08-11T03:00:00Z",
    "active": true,
    "signalPct": 92,
    "batteryPct": null,
    "freshnessPct": 99,
    "status": "reporting"
  },
  {
    "id": "st-028",
    "name": "Garissa Town Rain Gauge 02",
    "kind": "rain_gauge",
    "countyId": "garissa",
    "coords": [
      40.144,
      0.135
    ],
    "installedAt": "2023-04-14",
    "lastReadingAt": "2026-06-16T08:00:00Z",
    "active": false,
    "signalPct": null,
    "batteryPct": null,
    "freshnessPct": 19,
    "status": "offline"
  },
  {
    "id": "st-029",
    "name": "Kitui Town AWS",
    "kind": "weather",
    "countyId": "kitui",
    "coords": [
      38.501,
      -1.461
    ],
    "installedAt": "2024-10-09",
    "lastReadingAt": "2026-08-10T13:00:00Z",
    "active": true,
    "signalPct": 73,
    "batteryPct": 70,
    "freshnessPct": 98,
    "status": "reporting"
  },
  {
    "id": "st-030",
    "name": "Mwingi AWS",
    "kind": "weather",
    "countyId": "kitui",
    "coords": [
      38.67,
      -1.891
    ],
    "installedAt": "2019-07-24",
    "lastReadingAt": "2026-08-06T16:00:00Z",
    "active": true,
    "signalPct": 72,
    "batteryPct": 85,
    "freshnessPct": 63,
    "status": "stale"
  },
  {
    "id": "st-031",
    "name": "Mutomo Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "kitui",
    "coords": [
      38.145,
      -0.724
    ],
    "installedAt": "2022-10-21",
    "lastReadingAt": "2026-08-11T03:00:00Z",
    "active": true,
    "signalPct": 78,
    "batteryPct": 34,
    "freshnessPct": 97,
    "status": "reporting"
  },
  {
    "id": "st-032",
    "name": "Kanyangi Observer Post",
    "kind": "observer",
    "countyId": "kitui",
    "coords": [
      38.374,
      -1.611
    ],
    "installedAt": "2024-09-12",
    "lastReadingAt": "2026-08-10T23:00:00Z",
    "active": true,
    "signalPct": 62,
    "batteryPct": null,
    "freshnessPct": 93,
    "status": "reporting"
  },
  {
    "id": "st-033",
    "name": "Wote Water Point",
    "kind": "water_point",
    "countyId": "makueni",
    "coords": [
      37.845,
      -2.657
    ],
    "installedAt": "2017-05-24",
    "lastReadingAt": "2026-08-11T07:00:00Z",
    "active": true,
    "signalPct": 85,
    "batteryPct": 71,
    "freshnessPct": 84,
    "status": "reporting"
  },
  {
    "id": "st-034",
    "name": "Makindu Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "makueni",
    "coords": [
      37.64,
      -2.077
    ],
    "installedAt": "2022-11-25",
    "lastReadingAt": "2026-08-10T15:00:00Z",
    "active": true,
    "signalPct": 56,
    "batteryPct": 27,
    "freshnessPct": 93,
    "status": "reporting"
  },
  {
    "id": "st-035",
    "name": "Kibwezi Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "makueni",
    "coords": [
      37.814,
      -2.449
    ],
    "installedAt": "2021-06-17",
    "lastReadingAt": "2026-08-10T18:00:00Z",
    "active": true,
    "signalPct": 42,
    "batteryPct": 79,
    "freshnessPct": 94,
    "status": "reporting"
  },
  {
    "id": "st-036",
    "name": "Machakos Town Observer Post",
    "kind": "observer",
    "countyId": "machakos",
    "coords": [
      37.144,
      -1.544
    ],
    "installedAt": "2018-03-28",
    "lastReadingAt": "2026-08-11T02:00:00Z",
    "active": true,
    "signalPct": 70,
    "batteryPct": null,
    "freshnessPct": 97,
    "status": "reporting"
  },
  {
    "id": "st-037",
    "name": "Masinga Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "machakos",
    "coords": [
      37.461,
      -1.56
    ],
    "installedAt": "2020-03-22",
    "lastReadingAt": "2026-08-03T11:00:00Z",
    "active": true,
    "signalPct": 65,
    "batteryPct": 30,
    "freshnessPct": 38,
    "status": "stale"
  },
  {
    "id": "st-038",
    "name": "Kangundo Market Monitor",
    "kind": "market",
    "countyId": "machakos",
    "coords": [
      37.331,
      -1.055
    ],
    "installedAt": "2024-03-05",
    "lastReadingAt": "2026-08-06T00:00:00Z",
    "active": true,
    "signalPct": 68,
    "batteryPct": 71,
    "freshnessPct": 43,
    "status": "stale"
  },
  {
    "id": "st-039",
    "name": "Chuka Market Monitor",
    "kind": "market",
    "countyId": "tharaka_nithi",
    "coords": [
      37.653,
      -0.304
    ],
    "installedAt": "2021-03-26",
    "lastReadingAt": "2026-08-10T20:00:00Z",
    "active": true,
    "signalPct": 66,
    "batteryPct": 76,
    "freshnessPct": 83,
    "status": "reporting"
  },
  {
    "id": "st-040",
    "name": "Marimanti Observer Post",
    "kind": "observer",
    "countyId": "tharaka_nithi",
    "coords": [
      37.857,
      -0.258
    ],
    "installedAt": "2022-10-08",
    "lastReadingAt": "2026-08-11T02:00:00Z",
    "active": true,
    "signalPct": 87,
    "batteryPct": null,
    "freshnessPct": 90,
    "status": "reporting"
  },
  {
    "id": "st-041",
    "name": "Gatunga Rain Gauge",
    "kind": "rain_gauge",
    "countyId": "tharaka_nithi",
    "coords": [
      37.894,
      -0.188
    ],
    "installedAt": "2017-02-28",
    "lastReadingAt": "2026-08-10T15:00:00Z",
    "active": true,
    "signalPct": 48,
    "batteryPct": 55,
    "freshnessPct": 91,
    "status": "reporting"
  }
],
stationSeries: {"st-001":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.57,2.53,2.51,2.43,2.44,2.45,2.41,2.38,2.38,2.41,2.42,2.43,2.41,2.41,2.36,2.38,2.33,2.29,2.22,2.18,2.1,2.07,1.99,1.99,1.98,1.95]},"latest":{"var":"level_m","delta7dPct":-2}},"st-002":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[4,1,3,3,3,3,3,3,3,1,4,1,4,2,2,4,5,2,3,5,3,1,3,3,3,3]},"latest":{"var":"reports_n","delta7dPct":0}},"st-003":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[3,0,2.6,1.1,5.3,7.8,7.2,4.7,18.1,9.7,16.1,15.7,17.1,13.8,11.9,11.7,5.8,5.8,5.8,5.6,3.7,5.5,3.7,0,0,5.9]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-004":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[0,0,4.5,2.2,3.3,1.8,11.5,10.1,18.2,16.8,12.9,11.8,13.5,15.9,5.2,3.1,0.7,1.5,0,1.6,5.7,0,3.5,2.9,0,2.2],"temp_c":[34.9,33.4,34.2,35,33.9,33,33.4,32.3,31.1,31.1,31.1,32.2,30.4,31.8,31,33,34,33.8,34.2,34.8,33.7,34.2,33.2,35.1,33.2,34.4]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-005":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[2.5,0.8,0.6,1.6,4.8,7.1,1.4,5.3,8.3,19.9,9.9,10.3,15.2,7.9,13.6,9,0,0,3.9,0,0,2.9,1.8,0,1.5,1.1]},"latest":{"var":"rainfall_mm","delta7dPct":-27}},"st-006":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[4,3,3,3,3,3,2,2,4,4,2,5,5,3,3,2,4,5,5,4,2,5,3,5,2,2]},"latest":{"var":"reports_n","delta7dPct":0}},"st-007":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.54,2.55,2.51,2.52,2.43,2.42,2.41,2.45,2.43,2.48,2.46,2.52,2.51,2.51,2.49,2.45,2.4,2.4,2.37,2.32,2.28,2.22,2.18,2.1,2.07,2.07]},"latest":{"var":"level_m","delta7dPct":0}},"st-008":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[4,3,5,3,4,3,4,3,3,4,4,3,2,1,4,3,2,1,2,4,2,1,3,4,2,4]},"latest":{"var":"reports_n","delta7dPct":100}},"st-009":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[0,0,1.4,0,0,5.2,7,14.4,8.2,11.4,14,20.5,19.3,18.6,10.2,3.5,5.8,1.3,3,5.3,0,0,0,4.8,0.9,0],"temp_c":[32.9,34.9,33,34.1,34.1,33.5,33.7,32.1,32,31.3,32,31.9,30.2,30.9,33,32.3,33.8,34.1,33.9,33.6,33.7,33.6,34.3,34.9,34.9,33.4]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-010":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[1.1,0,0.2,2.7,0.9,2.7,13.4,7.3,12.3,9.5,11.7,10.5,10.4,11.2,13.8,7.8,3.2,0,6,2.7,0,0,3,0,1,0]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-011":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,4.1,0,0,5.4,0,10.5,11.5,8,16.4,20.4,12.2,19.1,9.8,16.3,6.8,2.8,0,0,0,0,0,0,0,5.5,3.2]},"latest":{"var":"rainfall_mm","delta7dPct":-42}},"st-012":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,0,0,2.3,3.5,9.5,11.7,15.3,10.1,17.4,16,19.8,11.5,7.2,14.7,12.3,9,0,0,0,5.4,2.1,1.6,0,1.6,2.3]},"latest":{"var":"rainfall_mm","delta7dPct":44}},"st-013":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[3.5,0,4.2,0,0.3,2.3,2.4,7.9,18,20.9,16.6,12.3,9.4,16.9,5.1,12.5,1.9,5.4,5.4,3.2,0,0,0,0,1.7,0.5]},"latest":{"var":"rainfall_mm","delta7dPct":-71}},"st-014":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[3,4,3,1,5,4,3,3,4,2,3,1,5,2,2,3,3,3,3,3,2,3,4,1,3,4]},"latest":{"var":"reports_n","delta7dPct":33}},"st-015":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[1.8,4.5,4.3,0,3.3,0,6.9,12.4,12,11.3,21.6,20.9,14.2,18.3,15.5,2.6,3.8,4.4,0,0,3.6,0,2.7,0,5.5,0]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-016":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.6,2.59,2.54,2.48,2.42,2.38,2.34,2.3,2.26,2.29,2.26,2.25,2.21,2.24,2.19,2.2,2.17,2.13,2.07,2.05,2.02,1.96,1.94,1.94,1.93,1.9]},"latest":{"var":"level_m","delta7dPct":-2}},"st-017":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[0,0,1.2,5.8,0,2.8,6.4,8.1,15.3,13.2,12.2,17.6,18.4,13.9,16.5,11.9,8.7,1.1,0.1,0,4.3,0,0,1.3,0,0],"temp_c":[34.5,33.2,33.4,33.2,33.7,34.4,32.6,32.5,32.4,31.9,30.5,31.8,30.9,30.9,31,33.1,33.9,34.9,34,33.4,34.3,34.3,33.5,34.9,34.7,34.3]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-018":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[1.5,0.1,5,0,5.5,7.7,2.5,15.1,15.8,19,12.8,11.3,19,11.9,11.4,11.8,2.7,0,0.4,0,0,5.6,5.5,0.8,0.4,0]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-019":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,4.5,0,0,6,5.8,4.4,8.3,9.7,11.7,20.6,21.7,16.7,11.8,13.7,3.5,4.8,0,1.1,0,0,0,0,1.9,0,2.2]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-020":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.59,2.56,2.49,2.43,2.36,2.37,2.31,2.31,2.33,2.32,2.28,2.29,2.25,2.28,2.27,2.23,2.21,2.18,2.14,2.14,2.15,2.07,1.98,1.98,1.96,1.93]},"latest":{"var":"level_m","delta7dPct":-2}},"st-021":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[0,0,0,3.7,0,0,4.9,12.1,15.9,17.8,21.5,15.8,19.3,18.1,13.1,11.7,2.2,0,0,0.1,1.5,0,5.6,5.6,2.7,5.7],"temp_c":[33.4,34.7,33,33.5,34,33.6,33.8,32.6,32.1,31.9,32.2,31.8,32.1,31.8,33,32.3,33.4,32.9,33.7,33.3,34.6,33.3,34.4,33.3,34.7,33.5]},"latest":{"var":"rainfall_mm","delta7dPct":111}},"st-022":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,0,0,5.3,5.6,1.9,5.4,15.4,16.1,11.7,13.9,11.9,15.9,17.9,13,11.1,7.9,2.3,2.6,0,0,0,0,5.5,0,0.7]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-023":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[3.9,0,4.9,5.4,2.6,0,3.8,10.7,17.8,13.8,19.9,10.6,9.4,14.6,9.2,3,5.4,4.5,0,0,0,0,0,5.3,4.8,0],"temp_c":[34,33.6,34,33.3,33.4,33.7,32.5,32,32.7,31.3,30,32,31.2,31.9,31.1,31.8,33.4,35.1,33.6,33.4,33.3,34,33.8,33.6,34.1,33.9]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-024":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.52,2.48,2.46,2.38,2.3,2.25,2.2,2.19,2.23,2.28,2.3,2.3,2.32,2.29,2.33,2.28,2.27,2.27,2.23,2.2,2.14,2.12,2.09,2.02,1.98,1.91]},"latest":{"var":"level_m","delta7dPct":-4}},"st-025":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"price_kes":"Goat price (KES)"},"series":{"price_kes":[3350,3310,3220,3190,3130,3060,3010,2950,2870,2890,2780,2740,2770,2780,2740,2640,2620,2530,2440,2470,2390,2380,2330,2350,2340,2310]},"latest":{"var":"price_kes","delta7dPct":-1}},"st-026":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[3.9,1.5,0,0,2.3,9,12.6,13.8,16.8,16.7,12.1,12.1,10.4,18.1,13.2,7.2,4.4,0,1.3,4.5,0,0,5.9,4.5,2.8,0],"temp_c":[34.1,35,33.4,33.1,32.9,33.1,32.1,32.8,32.4,31.4,30,32.1,30.8,31.8,31.6,32.6,34,34.6,34.8,33.6,33.2,33,34,33.3,34.7,34.1]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-027":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[3,5,4,4,2,2,1,1,4,1,1,1,2,3,3,1,4,5,3,3,3,1,5,3,1,2]},"latest":{"var":"reports_n","delta7dPct":100}},"st-028":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,0,0,2.7,2.6,2.4,4,9.5,16.2,10.4,11.9,15.2,20.3,12,5.4,2.7,9.4,1,6,0,0,0,0,3.6,2,0]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-029":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[5,5.3,1.3,0,0,6.2,4,6.8,15.1,20.1,14.4,21.2,11.1,18,8.9,6.2,2.6,0,0.1,5.7,3.2,0,0,0,0,3.6],"temp_c":[34,32.9,34.6,34.6,34.6,33.2,33,32.6,32.4,30.4,31.7,30.9,31.2,32.7,32.7,32.8,32.5,33.9,33.2,34.9,35.1,34.2,35.1,33.5,33.2,34.5]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-030":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)","temp_c":"Air temp (°C)"},"series":{"rainfall_mm":[0.7,0,0,0.5,0,9.8,13,11,10.8,14.6,15.3,12.9,12.3,10.7,5.9,13.3,0,0,0,0,5.1,0,0.4,1.9,5.3,0],"temp_c":[34.6,34.1,33.9,32.9,33.5,32.4,33.6,32.7,32.2,31.2,30.5,30.6,31.4,32.1,31.3,33.7,34.3,32.9,33.6,34.9,34.1,33.3,32.9,34.7,35.1,34.6]},"latest":{"var":"rainfall_mm","delta7dPct":-95}},"st-031":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,0,0,0,0,9.8,2.6,9,8.7,11.2,12.3,12.7,20.6,10.3,8.5,10.2,0.3,4.7,0.3,2.4,0,4.7,0.1,0,3.5,1.8]},"latest":{"var":"rainfall_mm","delta7dPct":-49}},"st-032":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[1,1,1,5,4,2,4,2,2,1,4,2,2,4,3,2,2,3,3,4,4,1,2,3,4,1]},"latest":{"var":"reports_n","delta7dPct":-75}},"st-033":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"level_m":"Water level (m)"},"series":{"level_m":[2.6,2.57,2.56,2.52,2.49,2.5,2.46,2.4,2.42,2.39,2.45,2.5,2.51,2.46,2.49,2.51,2.45,2.37,2.37,2.32,2.25,2.23,2.17,2.12,2.05,2.05]},"latest":{"var":"level_m","delta7dPct":0}},"st-034":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[4.8,0,4.6,0,0,6.9,12.7,10.6,18.2,11.1,19.9,21.6,17.7,10,14.3,12.1,3.9,0.7,0,0,4,5.6,0,2.8,1.4,0.2]},"latest":{"var":"rainfall_mm","delta7dPct":-86}},"st-035":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[2.1,0,1.9,0,1.7,0,2.7,5.6,12.6,10.7,14.1,19.6,10.4,14.8,4.9,2.8,9,0,3.4,0,0,0,0.6,0.6,5.8,2]},"latest":{"var":"rainfall_mm","delta7dPct":-66}},"st-036":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[4,3,3,3,1,4,5,2,1,5,4,2,1,3,4,3,4,1,4,3,2,5,5,4,4,4]},"latest":{"var":"reports_n","delta7dPct":0}},"st-037":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[0,0,0,3.7,0,6,10.1,12.6,9.1,19.7,15.9,19.7,18.1,10.1,15.1,8.4,0,0,1.7,4.8,0,0.7,0,1.5,0,0]},"latest":{"var":"rainfall_mm","delta7dPct":0}},"st-038":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"price_kes":"Goat price (KES)"},"series":{"price_kes":[3380,3280,3180,3100,3130,3040,2950,2970,2930,2870,2760,2750,2760,2770,2670,2670,2690,2600,2630,2520,2470,2420,2410,2350,2240,2210]},"latest":{"var":"price_kes","delta7dPct":-1}},"st-039":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"price_kes":"Goat price (KES)"},"series":{"price_kes":[3360,3370,3340,3390,3390,3410,3390,3440,3430,3340,3380,3430,3320,3270,3320,3280,3260,3230,3160,3130,3080,3120,3050,2980,3010,2990]},"latest":{"var":"price_kes","delta7dPct":-1}},"st-040":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"reports_n":"Reports filed"},"series":{"reports_n":[2,4,2,4,3,5,3,2,2,2,4,4,3,5,2,1,3,5,3,4,4,4,4,3,3,2]},"latest":{"var":"reports_n","delta7dPct":-33}},"st-041":{"t":["2026-02-16","2026-02-23","2026-03-02","2026-03-09","2026-03-16","2026-03-23","2026-03-30","2026-04-06","2026-04-13","2026-04-20","2026-04-27","2026-05-04","2026-05-11","2026-05-18","2026-05-25","2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29","2026-07-06","2026-07-13","2026-07-20","2026-07-27","2026-08-03","2026-08-10"],"vars":{"rainfall_mm":"Rainfall (mm)"},"series":{"rainfall_mm":[4.4,0,0,2.7,0,6.9,9.5,9.5,13.1,10.3,14.7,13.8,20.2,19.1,7.8,11.2,0,4.7,2.7,1.7,0,5.6,0,0,0,0]},"latest":{"var":"rainfall_mm","delta7dPct":0}}},
reports: [
  {
    "id": "rep-012",
    "topic": "pasture",
    "countyId": "kitui",
    "ward": "Kanyangi",
    "coords": [
      38.611,
      -1.132
    ],
    "observedAt": "2026-08-10T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 4,
    "photos": [
      {
        "id": "rep-012-p1",
        "url": "/v1/photos/rep-012-p1.jpg",
        "thumbUrl": "/v1/photos/rep-012-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-012-p2",
        "url": "/v1/photos/rep-012-p2.jpg",
        "thumbUrl": "/v1/photos/rep-012-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      },
      {
        "id": "rep-012-p3",
        "url": "/v1/photos/rep-012-p3.jpg",
        "thumbUrl": "/v1/photos/rep-012-p3_thumb.jpg",
        "width": 2048,
        "height": 1536
      },
      {
        "id": "rep-012-p4",
        "url": "/v1/photos/rep-012-p4.jpg",
        "thumbUrl": "/v1/photos/rep-012-p4_thumb.jpg",
        "width": 1600,
        "height": 1200
      }
    ],
    "messages": [
      {
        "id": "rep-012-m1",
        "authorId": "u-kyalo",
        "authorName": "Peter Kyalo",
        "avatarUrl": null,
        "body": "Grass cover almost gone across the Kanyangi rangeland strip. Households report moving herds toward the Tana riverine belt two weeks earlier than usual. Browse still available on hilltops.",
        "createdAt": "2026-08-10T08:00:00Z"
      },
      {
        "id": "rep-012-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Consistent with the VCI3M drop for Kitui this month. Flagging for verification once the field officer uploads the transect photos.",
        "createdAt": "2026-08-10T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 15.9,
      "usedInLabelVersion": null
    },
    "title": "Pasture failure, Kanyangi rangeland"
  },
  {
    "id": "rep-011",
    "topic": "water_point",
    "countyId": "marsabit",
    "ward": "Loiyangalani",
    "coords": [
      37.369,
      2.283
    ],
    "observedAt": "2026-08-09T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 5,
    "photos": [
      {
        "id": "rep-011-p1",
        "url": "/v1/photos/rep-011-p1.jpg",
        "thumbUrl": "/v1/photos/rep-011-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-011-p2",
        "url": "/v1/photos/rep-011-p2.jpg",
        "thumbUrl": "/v1/photos/rep-011-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      },
      {
        "id": "rep-011-p3",
        "url": "/v1/photos/rep-011-p3.jpg",
        "thumbUrl": "/v1/photos/rep-011-p3_thumb.jpg",
        "width": 2048,
        "height": 1536
      }
    ],
    "messages": [
      {
        "id": "rep-011-m1",
        "authorId": "u-galgalo",
        "authorName": "Halake Galgalo",
        "avatarUrl": null,
        "body": "Main community borehole down since Thursday. Pump motor burnt out and the standby generator has no fuel allocation. Around 400 households now trekking 11 km to the lake shore intake.",
        "createdAt": "2026-08-09T08:00:00Z"
      },
      {
        "id": "rep-011-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Escalated to the county water officer. Please log the queue length each morning if you can, it feeds the water stress indicator.",
        "createdAt": "2026-08-09T13:00:00Z"
      },
      {
        "id": "rep-011-m3",
        "authorId": "u-galgalo",
        "authorName": "Halake Galgalo",
        "avatarUrl": null,
        "body": "Queue this morning was roughly 3 hours at the shore intake. Two water trucks promised for the weekend.",
        "createdAt": "2026-08-09T18:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": null,
      "usedInLabelVersion": null
    },
    "title": "Borehole failure, Loiyangalani"
  },
  {
    "id": "rep-010",
    "topic": "livestock",
    "countyId": "wajir",
    "ward": "Eldas",
    "coords": [
      39.533,
      2.611
    ],
    "observedAt": "2026-08-08T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 3,
    "photos": [
      {
        "id": "rep-010-p1",
        "url": "/v1/photos/rep-010-p1.jpg",
        "thumbUrl": "/v1/photos/rep-010-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-010-p2",
        "url": "/v1/photos/rep-010-p2.jpg",
        "thumbUrl": "/v1/photos/rep-010-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      },
      {
        "id": "rep-010-p3",
        "url": "/v1/photos/rep-010-p3.jpg",
        "thumbUrl": "/v1/photos/rep-010-p3_thumb.jpg",
        "width": 2048,
        "height": 1536
      }
    ],
    "messages": [
      {
        "id": "rep-010-m1",
        "authorId": "u-abdi",
        "authorName": "Fatuma Abdi",
        "avatarUrl": null,
        "body": "Cattle body condition score dropping fast along the Eldas corridor, mostly score 2 of 5 at the market today. Goats still holding. No unusual mortality yet.",
        "createdAt": "2026-08-08T08:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 23.8,
      "usedInLabelVersion": null
    },
    "title": "Livestock body condition declining, Eldas"
  },
  {
    "id": "rep-009",
    "topic": "migration",
    "countyId": "turkana",
    "ward": "Loima",
    "coords": [
      35.62,
      3.856
    ],
    "observedAt": "2026-08-07T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 3,
    "photos": [
      {
        "id": "rep-009-p1",
        "url": "/v1/photos/rep-009-p1.jpg",
        "thumbUrl": "/v1/photos/rep-009-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-009-p2",
        "url": "/v1/photos/rep-009-p2.jpg",
        "thumbUrl": "/v1/photos/rep-009-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-009-m1",
        "authorId": "u-ekiru",
        "authorName": "Akai Ekiru",
        "avatarUrl": null,
        "body": "Three large herds moved through Loima toward the Uganda border pasture this week. Elders say this is a month earlier than a normal year. Water points along the route still functional.",
        "createdAt": "2026-08-07T08:00:00Z"
      },
      {
        "id": "rep-009-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Matches the rainfall anomaly signal for Turkana at minus 18 percent. Keeping this thread open through the Nov forecast window.",
        "createdAt": "2026-08-07T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 30.6,
      "usedInLabelVersion": null
    },
    "title": "Early migration toward Uganda border"
  },
  {
    "id": "rep-008",
    "topic": "market",
    "countyId": "mandera",
    "ward": "Banissa",
    "coords": [
      41.218,
      3.13
    ],
    "observedAt": "2026-08-06T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 2,
    "photos": [
      {
        "id": "rep-008-p1",
        "url": "/v1/photos/rep-008-p1.jpg",
        "thumbUrl": "/v1/photos/rep-008-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-008-p2",
        "url": "/v1/photos/rep-008-p2.jpg",
        "thumbUrl": "/v1/photos/rep-008-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-008-m1",
        "authorId": "u-hussein",
        "authorName": "Adan Hussein",
        "avatarUrl": null,
        "body": "Goat prices down again at Banissa, sellers outnumber buyers roughly three to one. Traders citing poor body condition and transport cost to Mandera town.",
        "createdAt": "2026-08-06T08:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 21.5,
      "usedInLabelVersion": null
    },
    "title": "Goat prices falling at Banissa market"
  },
  {
    "id": "rep-007",
    "topic": "crop",
    "countyId": "makueni",
    "ward": "Kibwezi",
    "coords": [
      38.032,
      -1.987
    ],
    "observedAt": "2026-08-05T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 4,
    "photos": [
      {
        "id": "rep-007-p1",
        "url": "/v1/photos/rep-007-p1.jpg",
        "thumbUrl": "/v1/photos/rep-007-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-007-p2",
        "url": "/v1/photos/rep-007-p2.jpg",
        "thumbUrl": "/v1/photos/rep-007-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      },
      {
        "id": "rep-007-p3",
        "url": "/v1/photos/rep-007-p3.jpg",
        "thumbUrl": "/v1/photos/rep-007-p3_thumb.jpg",
        "width": 2048,
        "height": 1536
      },
      {
        "id": "rep-007-p4",
        "url": "/v1/photos/rep-007-p4.jpg",
        "thumbUrl": "/v1/photos/rep-007-p4_thumb.jpg",
        "width": 1600,
        "height": 1200
      }
    ],
    "messages": [
      {
        "id": "rep-007-m1",
        "authorId": "u-mwende",
        "authorName": "Grace Mwende",
        "avatarUrl": null,
        "body": "Green gram fields around Kibwezi have failed almost completely, maybe one field in ten will harvest anything. Farmers ploughing in the residue for fodder.",
        "createdAt": "2026-08-05T08:00:00Z"
      },
      {
        "id": "rep-007-m2",
        "authorId": "u-kyalo",
        "authorName": "Peter Kyalo",
        "avatarUrl": null,
        "body": "Attached transect photos from the irrigation scheme boundary going east. The contrast with the irrigated plots is stark.",
        "createdAt": "2026-08-05T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 17.7,
      "usedInLabelVersion": null
    },
    "title": "Green gram crop failure, Kibwezi"
  },
  {
    "id": "rep-006",
    "topic": "pasture",
    "countyId": "garissa",
    "ward": "Balambala",
    "coords": [
      40.31,
      -0.902
    ],
    "observedAt": "2026-08-03T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 3,
    "photos": [
      {
        "id": "rep-006-p1",
        "url": "/v1/photos/rep-006-p1.jpg",
        "thumbUrl": "/v1/photos/rep-006-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-006-p2",
        "url": "/v1/photos/rep-006-p2.jpg",
        "thumbUrl": "/v1/photos/rep-006-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-006-m1",
        "authorId": "u-hussein",
        "authorName": "Adan Hussein",
        "avatarUrl": null,
        "body": "Pasture north of Balambala thinning quickly. Herders concentrating along the Tana. County grass reserve at Sankuri opened early.",
        "createdAt": "2026-08-03T08:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 26.1,
      "usedInLabelVersion": null
    },
    "title": "Pasture thinning north of Balambala"
  },
  {
    "id": "rep-005",
    "topic": "water_point",
    "countyId": "isiolo",
    "ward": "Merti",
    "coords": [
      38.457,
      0.63
    ],
    "observedAt": "2026-08-01T06:00:00Z",
    "status": "active",
    "verified": false,
    "severity": 2,
    "photos": [
      {
        "id": "rep-005-p1",
        "url": "/v1/photos/rep-005-p1.jpg",
        "thumbUrl": "/v1/photos/rep-005-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-005-p2",
        "url": "/v1/photos/rep-005-p2.jpg",
        "thumbUrl": "/v1/photos/rep-005-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-005-m1",
        "authorId": "u-lemayan",
        "authorName": "Sein Lemayan",
        "avatarUrl": null,
        "body": "River flow at the Merti intake noticeably below normal for August. Pump still operating on reduced hours. No conflict reported at the point yet.",
        "createdAt": "2026-08-01T08:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 36.4,
      "usedInLabelVersion": null
    },
    "title": "Ewaso flow low at Merti intake"
  },
  {
    "id": "rep-004",
    "topic": "pasture",
    "countyId": "kitui",
    "ward": "Mwingi North",
    "coords": [
      38.367,
      -1.496
    ],
    "observedAt": "2026-07-26T06:00:00Z",
    "status": "resolved",
    "verified": true,
    "severity": 4,
    "photos": [
      {
        "id": "rep-004-p1",
        "url": "/v1/photos/rep-004-p1.jpg",
        "thumbUrl": "/v1/photos/rep-004-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-004-p2",
        "url": "/v1/photos/rep-004-p2.jpg",
        "thumbUrl": "/v1/photos/rep-004-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      },
      {
        "id": "rep-004-p3",
        "url": "/v1/photos/rep-004-p3.jpg",
        "thumbUrl": "/v1/photos/rep-004-p3_thumb.jpg",
        "width": 2048,
        "height": 1536
      }
    ],
    "messages": [
      {
        "id": "rep-004-m1",
        "authorId": "u-kyalo",
        "authorName": "Peter Kyalo",
        "avatarUrl": null,
        "body": "Browse depleted across the transect, goats moving into hilltop thicket that is normally reserved for the late dry season.",
        "createdAt": "2026-07-26T08:00:00Z"
      },
      {
        "id": "rep-004-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Verified against the VCI3M pixel window for Mwingi North, estimate 16.2 against a county mean of 16.8. Folding into the vci3m_v1 label set for August.",
        "createdAt": "2026-07-26T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 16.2,
      "usedInLabelVersion": "vci3m_v1"
    },
    "title": "Browse depletion, Mwingi North"
  },
  {
    "id": "rep-003",
    "topic": "livestock",
    "countyId": "garissa",
    "ward": "Dadaab",
    "coords": [
      39.887,
      -0.462
    ],
    "observedAt": "2026-07-21T06:00:00Z",
    "status": "resolved",
    "verified": true,
    "severity": 3,
    "photos": [
      {
        "id": "rep-003-p1",
        "url": "/v1/photos/rep-003-p1.jpg",
        "thumbUrl": "/v1/photos/rep-003-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-003-p2",
        "url": "/v1/photos/rep-003-p2.jpg",
        "thumbUrl": "/v1/photos/rep-003-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-003-m1",
        "authorId": "u-hussein",
        "authorName": "Adan Hussein",
        "avatarUrl": null,
        "body": "Body condition around Dadaab host community at score 2 to 3, water trucking has stabilised the situation since the last report.",
        "createdAt": "2026-07-21T08:00:00Z"
      },
      {
        "id": "rep-003-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Verified and closed. Matches the July issue miss for Garissa, this ground report is exactly the kind of signal the bridge model needs.",
        "createdAt": "2026-07-21T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 25.4,
      "usedInLabelVersion": "vci3m_v1"
    },
    "title": "Livestock condition, Dadaab host community"
  },
  {
    "id": "rep-002",
    "topic": "market",
    "countyId": "machakos",
    "ward": "Masinga",
    "coords": [
      37.278,
      -1.314
    ],
    "observedAt": "2026-07-16T06:00:00Z",
    "status": "resolved",
    "verified": true,
    "severity": 2,
    "photos": [
      {
        "id": "rep-002-p1",
        "url": "/v1/photos/rep-002-p1.jpg",
        "thumbUrl": "/v1/photos/rep-002-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      }
    ],
    "messages": [
      {
        "id": "rep-002-m1",
        "authorId": "u-karimi",
        "authorName": "Joy Karimi",
        "avatarUrl": null,
        "body": "Maize prices at Masinga easing back after the July spike, supply coming in from the irrigated schemes. Livestock market volumes normal.",
        "createdAt": "2026-07-16T08:00:00Z"
      },
      {
        "id": "rep-002-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Verified. Noting for the record that the July forecast over-called Machakos, this thread supports the false-alarm classification.",
        "createdAt": "2026-07-16T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": 22,
      "usedInLabelVersion": "vci3m_v1"
    },
    "title": "Maize price spike easing, Masinga"
  },
  {
    "id": "rep-001",
    "topic": "water_point",
    "countyId": "samburu",
    "ward": "Baragoi",
    "coords": [
      36.947,
      1.728
    ],
    "observedAt": "2026-07-11T06:00:00Z",
    "status": "resolved",
    "verified": true,
    "severity": 3,
    "photos": [
      {
        "id": "rep-001-p1",
        "url": "/v1/photos/rep-001-p1.jpg",
        "thumbUrl": "/v1/photos/rep-001-p1_thumb.jpg",
        "width": 1600,
        "height": 1200
      },
      {
        "id": "rep-001-p2",
        "url": "/v1/photos/rep-001-p2.jpg",
        "thumbUrl": "/v1/photos/rep-001-p2_thumb.jpg",
        "width": 1200,
        "height": 1600
      }
    ],
    "messages": [
      {
        "id": "rep-001-m1",
        "authorId": "u-lemayan",
        "authorName": "Sein Lemayan",
        "avatarUrl": null,
        "body": "Hand-dug wells along the Baragoi lugga recharged after the late July showers, queue times back to normal.",
        "createdAt": "2026-07-11T08:00:00Z"
      },
      {
        "id": "rep-001-m2",
        "authorId": "u-analyst",
        "authorName": "Cascade Duty Analyst",
        "avatarUrl": null,
        "body": "Verified and closed. Samburu sits outside model coverage, so ground reports like this are the only label source we have there.",
        "createdAt": "2026-07-11T13:00:00Z"
      }
    ],
    "labelContribution": {
      "vci3mEstimate": null,
      "usedInLabelVersion": "vci3m_v1"
    },
    "title": "Seasonal wells recharged, Baragoi"
  }
],
triggers: [
  {
    "id": "trg-turkana",
    "tenantId": "tn-turkana",
    "tenantName": "Turkana County DRM",
    "levels": {
      "advisory": 0.15,
      "watch": 0.25,
      "warning": 0.4,
      "emergency": 0.6
    },
    "channels": [
      "sms",
      "email",
      "cap"
    ],
    "updatedAt": "2026-07-18T10:12:00Z",
    "updatedBy": "Akai Ekiru"
  },
  {
    "id": "trg-ndma",
    "tenantId": "tn-ndma",
    "tenantName": "NDMA National",
    "levels": {
      "advisory": 0.2,
      "watch": 0.3,
      "warning": 0.45,
      "emergency": 0.65
    },
    "channels": [
      "cap",
      "email"
    ],
    "updatedAt": "2026-06-30T08:45:00Z",
    "updatedBy": "Cascade Duty Analyst"
  },
  {
    "id": "trg-aaf",
    "tenantId": "tn-aaf",
    "tenantName": "Anticipatory Action Fund",
    "levels": {
      "advisory": 0.2,
      "watch": 0.35,
      "warning": 0.5,
      "emergency": 0.7
    },
    "channels": [
      "webhook",
      "email"
    ],
    "updatedAt": "2026-08-02T14:03:00Z",
    "updatedBy": "Joy Karimi"
  },
  {
    "id": "trg-krc",
    "tenantId": "tn-krc",
    "tenantName": "Kenya Red Cross, Eastern",
    "levels": {
      "advisory": 0.15,
      "watch": 0.25,
      "warning": 0.35,
      "emergency": 0.55
    },
    "channels": [
      "sms",
      "webhook"
    ],
    "updatedAt": "2026-07-25T09:30:00Z",
    "updatedBy": "Peter Kyalo"
  }
],
skill: {
  "labelVersion": "vci3m_v1",
  "model": "cascade-gbm v0.4.1",
  "period": {
    "from": "2022-09",
    "to": "2026-08"
  },
  "sampleCount": 423,
  "positives": 87,
  "metrics": {
    "rocAuc": 0.68,
    "prAuc": 0.52,
    "brier": 0.171,
    "brierSkillScore": 0.09,
    "reliability": 0.81
  },
  "perCounty": [
    {
      "countyId": "turkana",
      "rocAuc": 0.71,
      "brier": 0.148
    },
    {
      "countyId": "marsabit",
      "rocAuc": 0.69,
      "brier": 0.152
    },
    {
      "countyId": "isiolo",
      "rocAuc": 0.64,
      "brier": 0.166
    },
    {
      "countyId": "wajir",
      "rocAuc": 0.66,
      "brier": 0.171
    },
    {
      "countyId": "mandera",
      "rocAuc": 0.62,
      "brier": 0.183
    },
    {
      "countyId": "garissa",
      "rocAuc": 0.59,
      "brier": 0.194
    },
    {
      "countyId": "kitui",
      "rocAuc": 0.74,
      "brier": 0.139
    },
    {
      "countyId": "makueni",
      "rocAuc": 0.72,
      "brier": 0.144
    },
    {
      "countyId": "machakos",
      "rocAuc": 0.66,
      "brier": 0.176
    }
  ],
  "comparison": {
    "issueId": "2026-07",
    "validMonth": "2026-08",
    "forecast": {
      "title": "Forecast",
      "sub": "Issue 2026-07, valid Aug 2026",
      "histBins": [
        0,
        0.05,
        0.1,
        0.15,
        0.2,
        0.25,
        0.3,
        0.35,
        0.4,
        0.45,
        0.5,
        0.55,
        0.6,
        0.65,
        0.7,
        0.75,
        0.8,
        0.85,
        0.9,
        0.95
      ],
      "histCounts": [
        0,
        1,
        2,
        2,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        3,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "stats": [
        {
          "label": "Mean probability",
          "value": "0.291"
        },
        {
          "label": "Counties above threshold",
          "value": "4 of 9"
        },
        {
          "label": "Highest",
          "value": "Kitui 0.612"
        },
        {
          "label": "Lowest",
          "value": "Turkana 0.071"
        }
      ]
    },
    "observed": {
      "title": "Observed",
      "sub": "VCI3M truth, Aug 2026",
      "histBins": [
        0,
        0.05,
        0.1,
        0.15,
        0.2,
        0.25,
        0.3,
        0.35,
        0.4,
        0.45,
        0.5,
        0.55,
        0.6,
        0.65,
        0.7,
        0.75,
        0.8,
        0.85,
        0.9,
        0.95
      ],
      "histCounts": [
        6,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        3
      ],
      "stats": [
        {
          "label": "Drought outcomes",
          "value": "3 of 9"
        },
        {
          "label": "Hits",
          "value": "2"
        },
        {
          "label": "Misses",
          "value": "1 (Garissa)"
        },
        {
          "label": "False alarms",
          "value": "1 (Machakos)"
        }
      ]
    },
    "confusion": {
      "hits": 2,
      "misses": 1,
      "falseAlarms": 1,
      "correctNegatives": 5
    },
    "bigNumbers": {
      "left": {
        "label": "ROC AUC",
        "value": "0.68"
      },
      "right": {
        "label": "Brier Skill",
        "value": "0.09"
      }
    }
  },
  "reliability": {
    "bins": [
      {
        "predicted": 0.05,
        "observed": 0.031,
        "count": 96
      },
      {
        "predicted": 0.15,
        "observed": 0.108,
        "count": 88
      },
      {
        "predicted": 0.25,
        "observed": 0.221,
        "count": 64
      },
      {
        "predicted": 0.35,
        "observed": 0.312,
        "count": 52
      },
      {
        "predicted": 0.45,
        "observed": 0.364,
        "count": 38
      },
      {
        "predicted": 0.55,
        "observed": 0.517,
        "count": 28
      },
      {
        "predicted": 0.65,
        "observed": 0.583,
        "count": 21
      },
      {
        "predicted": 0.75,
        "observed": 0.706,
        "count": 16
      },
      {
        "predicted": 0.85,
        "observed": 0.741,
        "count": 12
      },
      {
        "predicted": 0.95,
        "observed": 0.882,
        "count": 8
      }
    ]
  },
  "leadTime": {
    "leads": [
      {
        "leadMonths": 1,
        "rocAuc": 0.72,
        "brierSkillScore": 0.13
      },
      {
        "leadMonths": 2,
        "rocAuc": 0.68,
        "brierSkillScore": 0.09
      },
      {
        "leadMonths": 3,
        "rocAuc": 0.61,
        "brierSkillScore": 0.04
      }
    ],
    "climatologyAuc": 0.5
  },
  "baselines": [
    {
      "id": "climatology",
      "label": "Climatology",
      "brierSkillScore": 0
    },
    {
      "id": "persistence",
      "label": "Persistence",
      "brierSkillScore": 0.03
    },
    {
      "id": "enso_only",
      "label": "ENSO only",
      "brierSkillScore": 0.04
    },
    {
      "id": "era5_only",
      "label": "ERA5 only",
      "brierSkillScore": 0.06
    },
    {
      "id": "full",
      "label": "Full model",
      "brierSkillScore": 0.09
    }
  ]
},
alerts: [
  {
    "id": "al-015",
    "issueId": "2026-08",
    "countyId": "kitui",
    "level": "emergency",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.934,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "webhook",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-015</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Sep 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.934</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Kitui County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-014",
    "issueId": "2026-08",
    "countyId": "makueni",
    "level": "emergency",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.934,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-014</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Sep 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.934</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Makueni County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-013",
    "issueId": "2026-08",
    "countyId": "machakos",
    "level": "emergency",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.934,
    "deliveries": [
      {
        "channel": "sms",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-013</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Sep 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.934</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Machakos County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-012",
    "issueId": "2026-08",
    "countyId": "wajir",
    "level": "warning",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.426,
    "deliveries": [
      {
        "channel": "sms",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-012</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought warning, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Severe</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.426</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Wajir County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-011",
    "issueId": "2026-08",
    "countyId": "mandera",
    "level": "warning",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.426,
    "deliveries": [
      {
        "channel": "sms",
        "state": "failed",
        "at": "2026-08-04T06:55:00Z",
        "error": "Carrier timeout after 3 retries"
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-011</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought warning, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Severe</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.426</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Mandera County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-010",
    "issueId": "2026-08",
    "countyId": "garissa",
    "level": "warning",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.426,
    "deliveries": [
      {
        "channel": "sms",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-010</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought warning, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Severe</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.426</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Garissa County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-009",
    "issueId": "2026-08",
    "countyId": "turkana",
    "level": "watch",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.337,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-009</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Nov 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.337</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Turkana County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-008",
    "issueId": "2026-08",
    "countyId": "marsabit",
    "level": "watch",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.337,
    "deliveries": [
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-008</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Nov 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.337</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Marsabit County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-007",
    "issueId": "2026-08",
    "countyId": "isiolo",
    "level": "watch",
    "firedAt": "2026-08-04T06:55:00Z",
    "probability": 0.337,
    "deliveries": [
      {
        "channel": "email",
        "state": "queued",
        "at": "2026-08-04T06:55:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-007</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-08-04T06:55:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Nov 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.337</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-08</value></parameter>\n    <area><areaDesc>Isiolo County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-006",
    "issueId": "2026-07",
    "countyId": "kitui",
    "level": "emergency",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.612,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "webhook",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-006</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Aug 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.612</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Kitui County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-005",
    "issueId": "2026-07",
    "countyId": "makueni",
    "level": "emergency",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.612,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-005</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Aug 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.612</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Makueni County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-004",
    "issueId": "2026-07",
    "countyId": "machakos",
    "level": "emergency",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.612,
    "deliveries": [
      {
        "channel": "sms",
        "state": "acked",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "cap",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-004</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought emergency, valid Aug 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Extreme</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.612</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Machakos County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-003",
    "issueId": "2026-07",
    "countyId": "wajir",
    "level": "watch",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.385,
    "deliveries": [
      {
        "channel": "sms",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-003</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.385</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Wajir County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-002",
    "issueId": "2026-07",
    "countyId": "mandera",
    "level": "watch",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.385,
    "deliveries": [
      {
        "channel": "sms",
        "state": "failed",
        "at": "2026-07-03T07:30:00Z",
        "error": "Carrier timeout after 3 retries"
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-002</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.385</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Mandera County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  },
  {
    "id": "al-001",
    "issueId": "2026-07",
    "countyId": "garissa",
    "level": "watch",
    "firedAt": "2026-07-03T07:30:00Z",
    "probability": 0.385,
    "deliveries": [
      {
        "channel": "sms",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      },
      {
        "channel": "email",
        "state": "sent",
        "at": "2026-07-03T07:30:00Z",
        "error": null
      }
    ],
    "capXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>cb-al-001</identifier>\n  <sender>alerts@cascadebridge.example</sender>\n  <sent>2026-07-03T07:30:00Z</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Drought watch, valid Oct 2026</event>\n    <urgency>Expected</urgency>\n    <severity>Moderate</severity>\n    <certainty>Likely</certainty>\n    <parameter><valueName>probability</valueName><value>0.385</value></parameter>\n    <parameter><valueName>issue</valueName><value>2026-07</value></parameter>\n    <area><areaDesc>Garissa County, Kenya</areaDesc></area>\n  </info>\n</alert>"
  }
],
histograms: {"prob":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[1,7,31,72,100,96,90,85,60,25,6,1,0,0,0,0,0,0],"stats":{"primary":{"value":"0.338","label":"Mean P(drought)"},"secondary":{"value":"171,515","label":"km² above threshold"}}},"agreement":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[0,0,0,0,0,0,0,0,3,18,54,95,100,63,24,8,10,16],"stats":{"primary":{"value":"0.784","label":"Mean Ensemble agreement"},"secondary":{"value":"336,492","label":"km² covered"}}},"p10":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[77,67,75,100,96,64,36,16,5,1,0,0,0,0,0,0,0,0],"stats":{"primary":{"value":"0.189","label":"Mean Probability p10"},"secondary":{"value":"336,492","label":"km² covered"}}},"p90":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[1,5,24,65,100,91,53,22,17,39,65,62,32,9,1,0,0,0],"stats":{"primary":{"value":"0.400","label":"Mean Probability p90"},"secondary":{"value":"336,492","label":"km² covered"}}},"tercile_below":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[0,0,0,2,11,37,75,98,100,83,48,16,3,0,0,0,0,0],"stats":{"primary":{"value":"0.467","label":"Mean Tercile below-normal"},"secondary":{"value":"336,492","label":"km² covered"}}},"vci3m":{"bins":[2.778,8.333,13.889,19.444,25,30.556,36.111,41.667,47.222,52.778,58.333,63.889,69.444,75,80.556,86.111,91.667,97.222],"counts":[3,12,33,64,91,100,82,49,20,5,1,0,0,0,0,0,0,0],"stats":{"primary":{"value":"29.1","label":"Mean VCI3M"},"secondary":{"value":"38,506","label":"km² below 20"}}},"ndvi":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[0,1,4,17,46,82,100,82,43,13,3,0,0,0,0,0,0,0],"stats":{"primary":{"value":"0.4","label":"Mean NDVI"},"secondary":{"value":"360,153","label":"km² monitored"}}},"ndvi_anom":{"bins":[-0.283,-0.25,-0.217,-0.183,-0.15,-0.117,-0.083,-0.05,-0.017,0.017,0.05,0.083,0.117,0.15,0.183,0.217,0.25,0.283],"counts":[0,0,3,14,43,82,100,78,39,13,3,0,0,0,0,0,0,0],"stats":{"primary":{"value":"-0.1","label":"Mean NDVI anomaly"},"secondary":{"value":"360,153","label":"km² monitored"}}},"chirps_precip":{"bins":[8.333,25,41.667,58.333,75,91.667,108.333,125,141.667,158.333,175,191.667,208.333,225,241.667,258.333,275,291.667],"counts":[80,100,73,31,7,1,0,0,0,0,0,0,0,0,0,0,0,0],"stats":{"primary":{"value":"22.5","label":"Mean CHIRPS rainfall"},"secondary":{"value":"360,153","label":"km² monitored"}}},"rain_anom":{"bins":[-75.556,-66.667,-57.778,-48.889,-40,-31.111,-22.222,-13.333,-4.444,4.444,13.333,22.222,31.111,40,48.889,57.778,66.667,75.556],"counts":[0,1,7,25,58,88,100,90,59,25,6,1,0,0,0,0,0,0],"stats":{"primary":{"value":"-22.3","label":"Mean Rainfall anomaly"},"secondary":{"value":"360,153","label":"km² monitored"}}},"spi3":{"bins":[-2.833,-2.5,-2.167,-1.833,-1.5,-1.167,-0.833,-0.5,-0.167,0.167,0.5,0.833,1.167,1.5,1.833,2.167,2.5,2.833],"counts":[0,2,10,35,74,100,92,57,22,5,1,0,0,0,0,0,0,0],"stats":{"primary":{"value":"-1.1","label":"Mean SPI-3"},"secondary":{"value":"360,153","label":"km² monitored"}}},"spi6":{"bins":[-2.833,-2.5,-2.167,-1.833,-1.5,-1.167,-0.833,-0.5,-0.167,0.167,0.5,0.833,1.167,1.5,1.833,2.167,2.5,2.833],"counts":[0,0,1,4,21,60,100,100,61,23,5,1,0,0,0,0,0,0],"stats":{"primary":{"value":"-0.7","label":"Mean SPI-6"},"secondary":{"value":"360,153","label":"km² monitored"}}},"lst_day":{"bins":[15.972,17.917,19.861,21.806,23.75,25.694,27.639,29.583,31.528,33.472,35.417,37.361,39.306,41.25,43.194,45.139,47.083,49.028],"counts":[0,0,0,0,1,5,21,52,89,100,74,39,16,5,1,0,0,0],"stats":{"primary":{"value":"33.2","label":"Mean LST day"},"secondary":{"value":"360,153","label":"km² monitored"}}},"lst_anom":{"bins":[-4.722,-4.167,-3.611,-3.056,-2.5,-1.944,-1.389,-0.833,-0.278,0.278,0.833,1.389,1.944,2.5,3.056,3.611,4.167,4.722],"counts":[0,0,0,0,0,0,1,4,19,50,87,100,80,44,17,4,1,0],"stats":{"primary":{"value":"1.4","label":"Mean LST anomaly"},"secondary":{"value":"360,153","label":"km² monitored"}}},"soil_moisture":{"bins":[1.25,3.75,6.25,8.75,11.25,13.75,16.25,18.75,21.25,23.75,26.25,28.75,31.25,33.75,36.25,38.75,41.25,43.75],"counts":[0,3,14,43,83,100,78,41,15,4,1,0,0,0,0,0,0,0],"stats":{"primary":{"value":"13.9","label":"Mean Soil moisture"},"secondary":{"value":"360,153","label":"km² monitored"}}},"bridge_rain":{"bins":[8.333,25,41.667,58.333,75,91.667,108.333,125,141.667,158.333,175,191.667,208.333,225,241.667,258.333,275,291.667],"counts":[79,100,81,40,12,2,0,0,0,0,0,0,0,0,0,0,0,0],"stats":{"primary":{"value":"24.2","label":"Mean Predicted rainfall"},"secondary":{"value":"360,153","label":"km² forecast"}}},"bridge_ndvi":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[0,1,8,28,67,100,93,53,19,4,0,0,0,0,0,0,0,0],"stats":{"primary":{"value":"0.3","label":"Mean Predicted NDVI"},"secondary":{"value":"360,153","label":"km² forecast"}}},"bridge_lst":{"bins":[15.972,17.917,19.861,21.806,23.75,25.694,27.639,29.583,31.528,33.472,35.417,37.361,39.306,41.25,43.194,45.139,47.083,49.028],"counts":[0,0,0,0,0,3,16,47,85,100,83,52,24,8,2,0,0,0],"stats":{"primary":{"value":"33.9","label":"Mean Predicted LST"},"secondary":{"value":"360,153","label":"km² forecast"}}},"fc_minus_obs":{"bins":[-0.944,-0.833,-0.722,-0.611,-0.5,-0.389,-0.278,-0.167,-0.056,0.056,0.167,0.278,0.389,0.5,0.611,0.722,0.833,0.944],"counts":[13,20,18,13,15,18,17,26,61,100,98,58,22,7,3,2,1,0],"stats":{"primary":{"value":"—","label":"Mean Forecast minus observed"},"secondary":{"value":"360,153","label":"km² verified"}}},"abs_error":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[76,100,89,64,38,23,21,19,11,5,4,4,8,17,23,18,8,2],"stats":{"primary":{"value":"0.397","label":"Mean Absolute error"},"secondary":{"value":"360,153","label":"km² verified"}}},"brier_contrib":{"bins":[0.028,0.083,0.139,0.194,0.25,0.306,0.361,0.417,0.472,0.528,0.583,0.639,0.694,0.75,0.806,0.861,0.917,0.972],"counts":[100,73,39,18,7,3,3,2,2,4,11,17,15,8,2,0,0,0],"stats":{"primary":{"value":"0.158","label":"Mean Brier contribution"},"secondary":{"value":"360,153","label":"km² verified"}}},"population":{"bins":[6.944,20.833,34.722,48.611,62.5,76.389,90.278,104.167,118.056,131.944,145.833,159.722,173.611,187.5,201.389,215.278,229.167,243.056],"counts":[97,100,65,28,8,2,1,2,3,3,2,1,0,0,1,2,2,2],"stats":{"primary":{"value":"59","label":"Mean Population"},"secondary":{"value":"360,153","label":"km²"}}},"soil_moisture_50":{"bins":[1.25,3.75,6.25,8.75,11.25,13.75,16.25,18.75,21.25,23.75,26.25,28.75,31.25,33.75,36.25,38.75,41.25,43.75],"counts":[0,0,1,5,23,58,93,100,76,40,14,3,0,0,0,0,0,0],"stats":{"primary":{"value":"18.3","label":"Mean Soil moisture, 50 cm"},"secondary":{"value":"360,153","label":"km² monitored"}}}},
layerValues: {
 "vci3m": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 29.1,
   "delta": -4.4,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 31.4,
    "delta": -4.2
   },
   "marsabit": {
    "value": 34.8,
    "delta": -2.1
   },
   "samburu": {
    "value": 41.2,
    "delta": -1.8
   },
   "isiolo": {
    "value": 37.2,
    "delta": -1.4
   },
   "wajir": {
    "value": 24.6,
    "delta": -6.8
   },
   "mandera": {
    "value": 22.1,
    "delta": -7.9
   },
   "garissa": {
    "value": 26.9,
    "delta": -5.5
   },
   "kitui": {
    "value": 16.8,
    "delta": -9.3
   },
   "makueni": {
    "value": 18.4,
    "delta": -8.1
   },
   "machakos": {
    "value": 21.7,
    "delta": -6.2
   },
   "tharaka_nithi": {
    "value": 44.6,
    "delta": -0.9
   }
  }
 },
 "ndvi": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 0.4,
   "delta": -0.03,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 0.38,
    "delta": -0.02
   },
   "marsabit": {
    "value": 0.4,
    "delta": -0.01
   },
   "samburu": {
    "value": 0.43,
    "delta": -0.01
   },
   "isiolo": {
    "value": 0.4,
    "delta": -0.01
   },
   "wajir": {
    "value": 0.33,
    "delta": -0.03
   },
   "mandera": {
    "value": 0.31,
    "delta": -0.03
   },
   "garissa": {
    "value": 0.34,
    "delta": -0.02
   },
   "kitui": {
    "value": 0.26,
    "delta": -0.04
   },
   "makueni": {
    "value": 0.28,
    "delta": -0.03
   },
   "machakos": {
    "value": 0.3,
    "delta": -0.02
   },
   "tharaka_nithi": {
    "value": 0.44,
    "delta": 0
   }
  }
 },
 "ndvi_anom": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": -0.1,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": -0.08,
    "delta": null
   },
   "marsabit": {
    "value": -0.07,
    "delta": null
   },
   "samburu": {
    "value": -0.04,
    "delta": null
   },
   "isiolo": {
    "value": -0.04,
    "delta": null
   },
   "wajir": {
    "value": -0.1,
    "delta": null
   },
   "mandera": {
    "value": -0.11,
    "delta": null
   },
   "garissa": {
    "value": -0.09,
    "delta": null
   },
   "kitui": {
    "value": -0.13,
    "delta": null
   },
   "makueni": {
    "value": -0.12,
    "delta": null
   },
   "machakos": {
    "value": -0.11,
    "delta": null
   },
   "tharaka_nithi": {
    "value": -0.03,
    "delta": null
   }
  }
 },
 "chirps_precip": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 22.5,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 28.5,
    "delta": null
   },
   "marsabit": {
    "value": 31.9,
    "delta": null
   },
   "samburu": {
    "value": 33.1,
    "delta": null
   },
   "isiolo": {
    "value": 26,
    "delta": null
   },
   "wajir": {
    "value": 16.8,
    "delta": null
   },
   "mandera": {
    "value": 13.1,
    "delta": null
   },
   "garissa": {
    "value": 18.5,
    "delta": null
   },
   "kitui": {
    "value": 14.8,
    "delta": null
   },
   "makueni": {
    "value": 15.4,
    "delta": null
   },
   "machakos": {
    "value": 17.5,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 32.4,
    "delta": null
   }
  }
 },
 "rain_anom": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": -22.3,
   "delta": -6,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": -18,
    "delta": -4
   },
   "marsabit": {
    "value": -12,
    "delta": -3
   },
   "samburu": {
    "value": -8,
    "delta": -2
   },
   "isiolo": {
    "value": -9,
    "delta": -2
   },
   "wajir": {
    "value": -31,
    "delta": -8
   },
   "mandera": {
    "value": -35,
    "delta": -9
   },
   "garissa": {
    "value": -28,
    "delta": -7
   },
   "kitui": {
    "value": -38,
    "delta": -9
   },
   "makueni": {
    "value": -34,
    "delta": -8
   },
   "machakos": {
    "value": -26,
    "delta": -6
   },
   "tharaka_nithi": {
    "value": -6,
    "delta": -1
   }
  }
 },
 "spi3": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": -1.1,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": -0.9,
    "delta": null
   },
   "marsabit": {
    "value": -0.8,
    "delta": null
   },
   "samburu": {
    "value": -0.7,
    "delta": null
   },
   "isiolo": {
    "value": -0.8,
    "delta": null
   },
   "wajir": {
    "value": -1.4,
    "delta": null
   },
   "mandera": {
    "value": -1.4,
    "delta": null
   },
   "garissa": {
    "value": -1.3,
    "delta": null
   },
   "kitui": {
    "value": -1.3,
    "delta": null
   },
   "makueni": {
    "value": -1.4,
    "delta": null
   },
   "machakos": {
    "value": -1.2,
    "delta": null
   },
   "tharaka_nithi": {
    "value": -0.5,
    "delta": null
   }
  }
 },
 "spi6": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": -0.7,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": -0.7,
    "delta": null
   },
   "marsabit": {
    "value": -0.4,
    "delta": null
   },
   "samburu": {
    "value": -0.4,
    "delta": null
   },
   "isiolo": {
    "value": -0.5,
    "delta": null
   },
   "wajir": {
    "value": -0.9,
    "delta": null
   },
   "mandera": {
    "value": -0.8,
    "delta": null
   },
   "garissa": {
    "value": -0.7,
    "delta": null
   },
   "kitui": {
    "value": -0.8,
    "delta": null
   },
   "makueni": {
    "value": -0.9,
    "delta": null
   },
   "machakos": {
    "value": -0.8,
    "delta": null
   },
   "tharaka_nithi": {
    "value": -0.3,
    "delta": null
   }
  }
 },
 "lst_day": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 33.2,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 32,
    "delta": null
   },
   "marsabit": {
    "value": 33,
    "delta": null
   },
   "samburu": {
    "value": 29.9,
    "delta": null
   },
   "isiolo": {
    "value": 30.2,
    "delta": null
   },
   "wajir": {
    "value": 33.7,
    "delta": null
   },
   "mandera": {
    "value": 34.8,
    "delta": null
   },
   "garissa": {
    "value": 33.5,
    "delta": null
   },
   "kitui": {
    "value": 37.4,
    "delta": null
   },
   "makueni": {
    "value": 36.8,
    "delta": null
   },
   "machakos": {
    "value": 34.3,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 29.2,
    "delta": null
   }
  }
 },
 "lst_anom": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 1.4,
   "delta": 0.4,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 1.2,
    "delta": 0.4
   },
   "marsabit": {
    "value": 0.9,
    "delta": 0.3
   },
   "samburu": {
    "value": 0.5,
    "delta": 0.2
   },
   "isiolo": {
    "value": 0.7,
    "delta": 0.2
   },
   "wajir": {
    "value": 1.7,
    "delta": 0.5
   },
   "mandera": {
    "value": 1.9,
    "delta": 0.6
   },
   "garissa": {
    "value": 1.5,
    "delta": 0.5
   },
   "kitui": {
    "value": 2.4,
    "delta": 0.7
   },
   "makueni": {
    "value": 2.1,
    "delta": 0.6
   },
   "machakos": {
    "value": 1.8,
    "delta": 0.5
   },
   "tharaka_nithi": {
    "value": 0.3,
    "delta": 0.1
   }
  }
 },
 "soil_moisture": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 13.9,
   "delta": -1.1,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 14.3,
    "delta": -0.5
   },
   "marsabit": {
    "value": 15.1,
    "delta": -0.3
   },
   "samburu": {
    "value": 18.7,
    "delta": -0.2
   },
   "isiolo": {
    "value": 16,
    "delta": -0.2
   },
   "wajir": {
    "value": 12,
    "delta": -0.8
   },
   "mandera": {
    "value": 11.3,
    "delta": -0.9
   },
   "garissa": {
    "value": 12.7,
    "delta": -0.7
   },
   "kitui": {
    "value": 11.4,
    "delta": -1.1
   },
   "makueni": {
    "value": 10.6,
    "delta": -1
   },
   "machakos": {
    "value": 13.4,
    "delta": -0.7
   },
   "tharaka_nithi": {
    "value": 17.6,
    "delta": -0.1
   }
  }
 },
 "soil_moisture_50": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 18.3,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² monitored"
  },
  "values": {
   "turkana": {
    "value": 18.6,
    "delta": null
   },
   "marsabit": {
    "value": 20.6,
    "delta": null
   },
   "samburu": {
    "value": 22.2,
    "delta": null
   },
   "isiolo": {
    "value": 20.8,
    "delta": null
   },
   "wajir": {
    "value": 16.5,
    "delta": null
   },
   "mandera": {
    "value": 16.8,
    "delta": null
   },
   "garissa": {
    "value": 16.2,
    "delta": null
   },
   "kitui": {
    "value": 14.6,
    "delta": null
   },
   "makueni": {
    "value": 15,
    "delta": null
   },
   "machakos": {
    "value": 16.2,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 24,
    "delta": null
   }
  }
 },
 "bridge_rain": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 24.2,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² forecast"
  },
  "values": {
   "turkana": {
    "value": 32.5,
    "delta": null
   },
   "marsabit": {
    "value": 37.2,
    "delta": null
   },
   "samburu": {
    "value": 32.3,
    "delta": null
   },
   "isiolo": {
    "value": 40.6,
    "delta": null
   },
   "wajir": {
    "value": 15.3,
    "delta": null
   },
   "mandera": {
    "value": 11.3,
    "delta": null
   },
   "garissa": {
    "value": 16.4,
    "delta": null
   },
   "kitui": {
    "value": 6.6,
    "delta": null
   },
   "makueni": {
    "value": 20.6,
    "delta": null
   },
   "machakos": {
    "value": 20.9,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 32.8,
    "delta": null
   }
  }
 },
 "bridge_ndvi": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 0.3,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² forecast"
  },
  "values": {
   "turkana": {
    "value": 0.34,
    "delta": null
   },
   "marsabit": {
    "value": 0.35,
    "delta": null
   },
   "samburu": {
    "value": 0.38,
    "delta": null
   },
   "isiolo": {
    "value": 0.37,
    "delta": null
   },
   "wajir": {
    "value": 0.3,
    "delta": null
   },
   "mandera": {
    "value": 0.27,
    "delta": null
   },
   "garissa": {
    "value": 0.32,
    "delta": null
   },
   "kitui": {
    "value": 0.26,
    "delta": null
   },
   "makueni": {
    "value": 0.26,
    "delta": null
   },
   "machakos": {
    "value": 0.28,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 0.4,
    "delta": null
   }
  }
 },
 "bridge_lst": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 33.9,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² forecast"
  },
  "values": {
   "turkana": {
    "value": 32.9,
    "delta": null
   },
   "marsabit": {
    "value": 32,
    "delta": null
   },
   "samburu": {
    "value": 31.4,
    "delta": null
   },
   "isiolo": {
    "value": 31.2,
    "delta": null
   },
   "wajir": {
    "value": 35.5,
    "delta": null
   },
   "mandera": {
    "value": 36,
    "delta": null
   },
   "garissa": {
    "value": 33.5,
    "delta": null
   },
   "kitui": {
    "value": 37.9,
    "delta": null
   },
   "makueni": {
    "value": 36.1,
    "delta": null
   },
   "machakos": {
    "value": 34.7,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 32,
    "delta": null
   }
  }
 },
 "fc_minus_obs": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": null,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² verified"
  },
  "values": {
   "turkana": {
    "value": 0.071,
    "delta": null
   },
   "marsabit": {
    "value": 0.071,
    "delta": null
   },
   "samburu": {
    "value": null,
    "delta": null
   },
   "isiolo": {
    "value": 0.071,
    "delta": null
   },
   "wajir": {
    "value": 0.19,
    "delta": null
   },
   "mandera": {
    "value": 0.19,
    "delta": null
   },
   "garissa": {
    "value": -0.81,
    "delta": null
   },
   "kitui": {
    "value": -0.388,
    "delta": null
   },
   "makueni": {
    "value": -0.388,
    "delta": null
   },
   "machakos": {
    "value": 0.612,
    "delta": null
   },
   "tharaka_nithi": {
    "value": null,
    "delta": null
   }
  }
 },
 "abs_error": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 0.397,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² verified"
  },
  "values": {
   "turkana": {
    "value": 0.071,
    "delta": null
   },
   "marsabit": {
    "value": 0.071,
    "delta": null
   },
   "samburu": {
    "value": null,
    "delta": null
   },
   "isiolo": {
    "value": 0.071,
    "delta": null
   },
   "wajir": {
    "value": 0.19,
    "delta": null
   },
   "mandera": {
    "value": 0.19,
    "delta": null
   },
   "garissa": {
    "value": 0.81,
    "delta": null
   },
   "kitui": {
    "value": 0.388,
    "delta": null
   },
   "makueni": {
    "value": 0.388,
    "delta": null
   },
   "machakos": {
    "value": 0.612,
    "delta": null
   },
   "tharaka_nithi": {
    "value": null,
    "delta": null
   }
  }
 },
 "brier_contrib": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 0.158,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km² verified"
  },
  "values": {
   "turkana": {
    "value": 0.005,
    "delta": null
   },
   "marsabit": {
    "value": 0.005,
    "delta": null
   },
   "samburu": {
    "value": null,
    "delta": null
   },
   "isiolo": {
    "value": 0.005,
    "delta": null
   },
   "wajir": {
    "value": 0.036,
    "delta": null
   },
   "mandera": {
    "value": 0.036,
    "delta": null
   },
   "garissa": {
    "value": 0.656,
    "delta": null
   },
   "kitui": {
    "value": 0.151,
    "delta": null
   },
   "makueni": {
    "value": 0.151,
    "delta": null
   },
   "machakos": {
    "value": 0.375,
    "delta": null
   },
   "tharaka_nithi": {
    "value": null,
    "delta": null
   }
  }
 },
 "population": {
  "asOf": "2026-08-01",
  "summary": {
   "mean": 59,
   "delta": null,
   "totalAreaKm2": 360153,
   "areaLabel": "km²"
  },
  "values": {
   "turkana": {
    "value": 13,
    "delta": null
   },
   "marsabit": {
    "value": 6,
    "delta": null
   },
   "samburu": {
    "value": 15,
    "delta": null
   },
   "isiolo": {
    "value": 11,
    "delta": null
   },
   "wajir": {
    "value": 14,
    "delta": null
   },
   "mandera": {
    "value": 33,
    "delta": null
   },
   "garissa": {
    "value": 19,
    "delta": null
   },
   "kitui": {
    "value": 37,
    "delta": null
   },
   "makueni": {
    "value": 123,
    "delta": null
   },
   "machakos": {
    "value": 229,
    "delta": null
   },
   "tharaka_nithi": {
    "value": 149,
    "delta": null
   }
  }
 }
},
ensemble: {"asal_north":{"months":["2026-09","2026-10","2026-11"],"members":[[0.088,0.218,0.245],[0.089,0.219,0.246],[0.089,0.22,0.247],[0.089,0.22,0.248],[0.089,0.221,0.277],[0.089,0.222,0.28],[0.089,0.223,0.283],[0.089,0.224,0.285],[0.09,0.225,0.288],[0.09,0.226,0.291],[0.09,0.227,0.294],[0.09,0.228,0.297],[0.09,0.229,0.3],[0.091,0.23,0.303],[0.091,0.231,0.305],[0.091,0.232,0.308],[0.091,0.234,0.311],[0.091,0.235,0.314],[0.092,0.25,0.317],[0.092,0.251,0.32],[0.092,0.252,0.323],[0.092,0.252,0.326],[0.092,0.253,0.328],[0.093,0.254,0.331],[0.093,0.254,0.334],[0.093,0.255,0.337],[0.093,0.255,0.34],[0.093,0.256,0.343],[0.094,0.256,0.346],[0.094,0.257,0.348],[0.094,0.257,0.351],[0.094,0.258,0.354],[0.094,0.258,0.357],[0.095,0.259,0.36],[0.095,0.259,0.363],[0.095,0.26,0.366],[0.095,0.26,0.369],[0.095,0.261,0.371],[0.096,0.261,0.374],[0.096,0.262,0.377],[0.096,0.262,0.38],[0.096,0.263,0.383],[0.096,0.263,0.386],[0.097,0.264,0.389],[0.097,0.264,0.391],[0.097,0.265,0.394],[0.097,0.265,0.397],[0.097,0.266,0.398],[0.097,0.266,0.4],[0.097,0.267,0.402],[0.098,0.268,0.404]],"mean":[0.093,0.243,0.337],"p10":[0.086,0.212,0.28],"p90":[0.094,0.255,0.397],"membersAboveThreshold":[0,33,47],"threshold":0.25},"asal_northeast":{"months":["2026-09","2026-10","2026-11"],"members":[[0.284,0.115,0.003],[0.284,0.115,0.003],[0.284,0.115,0.003],[0.284,0.115,0.003],[0.284,0.124,0.003],[0.284,0.136,0.003],[0.284,0.15,0.003],[0.284,0.165,0.003],[0.284,0.179,0.003],[0.284,0.194,0.003],[0.284,0.208,0.004],[0.284,0.222,0.004],[0.284,0.237,0.004],[0.284,0.247,0.004],[0.284,0.248,0.004],[0.284,0.28,0.004],[0.284,0.295,0.004],[0.284,0.309,0.004],[0.284,0.324,0.004],[0.284,0.338,0.004],[0.284,0.353,0.005],[0.284,0.367,0.005],[0.284,0.382,0.005],[0.284,0.396,0.005],[0.284,0.41,0.005],[0.284,0.425,0.005],[0.284,0.439,0.005],[0.284,0.454,0.005],[0.284,0.468,0.005],[0.284,0.483,0.005],[0.284,0.497,0.005],[0.284,0.512,0.006],[0.284,0.526,0.006],[0.284,0.541,0.006],[0.284,0.555,0.006],[0.284,0.57,0.006],[0.284,0.584,0.006],[0.284,0.598,0.006],[0.284,0.613,0.006],[0.284,0.627,0.006],[0.284,0.642,0.006],[0.284,0.656,0.007],[0.284,0.671,0.007],[0.284,0.685,0.007],[0.284,0.7,0.007],[0.284,0.714,0.007],[0.284,0.725,0.007],[0.284,0.735,0.007],[0.284,0.744,0.007],[0.284,0.753,0.007],[0.284,0.762,0.007]],"mean":[0.284,0.426,0.005],"p10":[0.284,0.016,0.002],"p90":[0.284,0.606,0.006],"membersAboveThreshold":[51,36,0],"threshold":0.25},"asal_eastern":{"months":["2026-09","2026-10","2026-11"],"members":[[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.001],[0.934,0.345,0.002],[0.934,0.345,0.004],[0.934,0.345,0.006],[0.934,0.345,0.009],[0.934,0.345,0.011],[0.934,0.345,0.013],[0.934,0.345,0.015],[0.934,0.345,0.017],[0.934,0.345,0.02],[0.934,0.345,0.022],[0.934,0.345,0.024],[0.934,0.345,0.026],[0.934,0.345,0.029],[0.934,0.345,0.031],[0.934,0.345,0.033],[0.934,0.345,0.035],[0.934,0.345,0.037],[0.934,0.345,0.04],[0.934,0.345,0.042],[0.934,0.345,0.044],[0.934,0.345,0.046],[0.934,0.345,0.048],[0.934,0.345,0.051],[0.934,0.345,0.053],[0.934,0.345,0.055],[0.934,0.345,0.057],[0.934,0.345,0.059],[0.934,0.345,0.062],[0.934,0.345,0.064],[0.934,0.345,0.066],[0.934,0.345,0.068],[0.934,0.345,0.07],[0.934,0.345,0.073],[0.934,0.345,0.075],[0.934,0.345,0.077],[0.934,0.345,0.078],[0.934,0.345,0.079],[0.934,0.345,0.081],[0.934,0.345,0.252]],"mean":[0.934,0.345,0.031],"p10":[0.934,0.34,0.002],"p90":[0.934,0.34,0.092],"membersAboveThreshold":[51,51,1],"threshold":0.25},"context":{"enso":{"index":"Nino3.4","value":0.6,"phase":"Weak El Niño","asOf":"2026-07"},"iod":{"index":"DMI","value":0.3,"phase":"Neutral-positive","asOf":"2026-07"}}},
settings: {
  "organisation": {
    "name": "NDMA Kenya — Cascade Bridge pilot",
    "tenantId": "tn-ndma",
    "region": "ASAL counties",
    "plan": "Pilot",
    "seats": 12,
    "countiesCovered": 9,
    "countiesTotal": 11
  },
  "members": [
    {
      "name": "Cascade Duty Analyst",
      "email": "duty@cascadebridge.example",
      "role": "Owner",
      "lastActiveAt": "2026-08-11T07:40:00Z"
    },
    {
      "name": "Akai Ekiru",
      "email": "a.ekiru@turkana.go.ke",
      "role": "County editor",
      "lastActiveAt": "2026-08-10T16:22:00Z"
    },
    {
      "name": "Joy Karimi",
      "email": "j.karimi@aafund.example",
      "role": "Tenant admin",
      "lastActiveAt": "2026-08-09T11:05:00Z"
    },
    {
      "name": "Peter Kyalo",
      "email": "p.kyalo@redcross.or.ke",
      "role": "Viewer",
      "lastActiveAt": "2026-08-08T09:48:00Z"
    },
    {
      "name": "Fatuma Abdi",
      "email": "f.abdi@wajir.go.ke",
      "role": "Field reporter",
      "lastActiveAt": "2026-08-11T05:12:00Z"
    },
    {
      "name": "Halake Galgalo",
      "email": "h.galgalo@marsabit.go.ke",
      "role": "Field reporter",
      "lastActiveAt": "2026-08-07T14:31:00Z"
    }
  ],
  "apiKeys": [
    {
      "id": "key-ingest",
      "label": "Station ingest",
      "prefix": "cbk_ing_4f21",
      "createdAt": "2025-11-02",
      "lastUsedAt": "2026-08-11T08:55:00Z",
      "rateLimitRpm": 120,
      "scopes": [
        "stations:write"
      ]
    },
    {
      "id": "key-read",
      "label": "County dashboard, public",
      "prefix": "cbk_pub_9c07",
      "createdAt": "2026-01-15",
      "lastUsedAt": "2026-08-11T06:03:00Z",
      "rateLimitRpm": 600,
      "scopes": [
        "issues:read",
        "layers:read"
      ]
    },
    {
      "id": "key-cap",
      "label": "CAP relay, MET",
      "prefix": "cbk_cap_2ab8",
      "createdAt": "2026-03-28",
      "lastUsedAt": "2026-08-04T06:56:00Z",
      "rateLimitRpm": 30,
      "scopes": [
        "alerts:read"
      ]
    }
  ],
  "sources": [
    {
      "id": "src-seas5",
      "name": "ECMWF SEAS5",
      "kind": "Forecast GRIB",
      "endpoint": "mars://seas5/monthly",
      "freshnessHours": 168,
      "staleAfterHours": 800,
      "lastIngestAt": "2026-08-04T02:10:00Z",
      "status": "ok"
    },
    {
      "id": "src-chirps",
      "name": "CHIRPS rainfall",
      "kind": "Raster",
      "endpoint": "s3://chirps/africa/monthly",
      "freshnessHours": 26,
      "staleAfterHours": 72,
      "lastIngestAt": "2026-08-10T07:00:00Z",
      "status": "ok"
    },
    {
      "id": "src-modis",
      "name": "MODIS NDVI / VCI3M",
      "kind": "Raster",
      "endpoint": "s3://modis/vci3m",
      "freshnessHours": 54,
      "staleAfterHours": 96,
      "lastIngestAt": "2026-08-09T03:00:00Z",
      "status": "ok"
    },
    {
      "id": "src-era5",
      "name": "ERA5 reanalysis",
      "kind": "Reanalysis",
      "endpoint": "cds://era5/monthly",
      "freshnessHours": 210,
      "staleAfterHours": 168,
      "lastIngestAt": "2026-08-02T15:00:00Z",
      "status": "stale"
    },
    {
      "id": "src-stations",
      "name": "County station network",
      "kind": "Point ingest",
      "endpoint": "/v1/stations/ingest",
      "freshnessHours": 1,
      "staleAfterHours": 24,
      "lastIngestAt": "2026-08-11T08:55:00Z",
      "status": "ok"
    }
  ],
  "export": {
    "schedules": [
      {
        "id": "exp-netcdf",
        "format": "NetCDF",
        "target": "s3://ndma-cascade/issues/",
        "cadence": "On publish",
        "lastRunAt": "2026-08-04T07:02:00Z",
        "enabled": true
      },
      {
        "id": "exp-geotiff",
        "format": "GeoTIFF",
        "target": "s3://ndma-cascade/tiles/",
        "cadence": "On publish",
        "lastRunAt": "2026-08-04T07:04:00Z",
        "enabled": true
      },
      {
        "id": "exp-cap",
        "format": "CAP 1.2",
        "target": "https://cap.meteo.go.ke/inbox",
        "cadence": "On alert",
        "lastRunAt": "2026-08-04T06:56:00Z",
        "enabled": false
      }
    ]
  }
},
geo: {"type":"FeatureCollection", "features": [
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[36.0506,4.4562],[35.9439,4.548],[35.9389,4.5844],[35.9493,4.6286],[35.8121,4.7824],[35.8118,5.0957],[35.8397,5.1258],[35.8518,5.1478],[35.8616,5.1567],[35.8641,5.1825],[35.8537,5.2031],[35.8387,5.2113],[35.8277,5.2422],[35.8296,5.2606],[35.8421,5.2719],[35.8638,5.3006],[35.8619,5.3211],[35.8542,5.3212],[35.8182,5.3421],[35.7905,5.3454],[35.7852,5.3531],[35.7685,5.3512],[35.7549,5.3569],[35.7514,5.3731],[35.7237,5.379],[35.7133,5.3895],[35.6969,5.3909],[35.6714,5.3844],[35.6474,5.3888],[35.6322,5.3823],[35.6128,5.4046],[35.598,5.3999],[35.5863,5.4162],[35.5598,5.4229],[35.485,5.4297],[35.2918,5.4306],[35.1946,5.2767],[34.3658,4.5766],[33.9928,4.2225],[34.039,4.1875],[34.0486,4.1783],[34.067,4.1422],[34.0508,4.1208],[34.064,4.0932],[34.0818,4.085],[34.0931,4.0687],[34.0904,4.0376],[34.0598,4.0279],[34.062,4.0094],[34.0815,4.0035],[34.1059,3.9769],[34.1344,3.9616],[34.1217,3.9088],[34.1152,3.8974],[34.0912,3.8856],[34.0885,3.8616],[34.1278,3.8722],[34.1495,3.8689],[34.1672,3.8703],[34.1754,3.88],[34.2156,3.8815],[34.2254,3.8514],[34.2254,3.8308],[34.1795,3.8317],[34.1628,3.8104],[34.1707,3.8005],[34.1886,3.7954],[34.1904,3.7834],[34.1702,3.7751],[34.1718,3.7677],[34.2212,3.7845],[34.2455,3.7843],[34.2672,3.7474],[34.283,3.7314],[34.3078,3.7124],[34.3242,3.7274],[34.3537,3.7353],[34.3778,3.7307],[34.3998,3.7062],[34.4031,3.6929],[34.4249,3.688],[34.4548,3.6769],[34.463,3.6696],[34.4531,3.6118],[34.4565,3.5787],[34.451,3.5188],[34.4235,3.4915],[34.398,3.4886],[34.3904,3.4844],[34.4165,3.4511],[34.419,3.4337],[34.41,3.4184],[34.4016,3.4148],[34.4006,3.3713],[34.4292,3.3431],[34.4383,3.3079],[34.4474,3.2839],[34.4552,3.2007],[34.4554,3.1828],[34.4607,3.1743],[34.4827,3.1648],[34.4947,3.1415],[34.5133,3.1511],[34.5476,3.1388],[34.5593,3.113],[34.5755,3.0992],[34.5779,3.0699],[34.5774,3.0233],[34.5883,3.0041],[34.5894,2.982],[34.5991,2.9261],[34.6401,2.9076],[34.6535,2.8675],[34.6927,2.8629],[34.7023,2.8781],[34.7123,2.8654],[34.737,2.8552],[34.7493,2.8258],[34.7666,2.8226],[34.7812,2.7681],[34.7838,2.7429],[34.7749,2.6978],[34.7895,2.684],[34.7985,2.6557],[34.8302,2.6207],[34.8519,2.5835],[34.8673,2.5708],[34.8781,2.5727],[34.8794,2.5896],[34.897,2.5881],[34.9043,2.5492],[34.9127,2.5167],[34.9318,2.5166],[34.9514,2.4591],[34.9408,2.4531],[34.9712,2.4365],[35.01,2.4035],[35.0087,2.4247],[35.0214,2.4338],[35.0169,2.4535],[34.9973,2.4751],[35.0047,2.5084],[35.0096,2.554],[35.0161,2.5676],[35.0264,2.5648],[35.0316,2.5372],[35.0443,2.5169],[35.06,2.4841],[35.0679,2.4625],[35.0933,2.4786],[35.101,2.4883],[35.1105,2.5206],[35.1045,2.5475],[35.1073,2.5689],[35.117,2.6037],[35.1277,2.6234],[35.1305,2.6449],[35.1605,2.6482],[35.1744,2.6368],[35.1982,2.5918],[35.2129,2.5507],[35.2249,2.5299],[35.2201,2.4938],[35.2226,2.4623],[35.2317,2.4414],[35.2233,2.412],[35.2366,2.3786],[35.2321,2.3512],[35.239,2.3435],[35.2613,2.3317],[35.2856,2.2976],[35.298,2.2707],[35.3088,2.2342],[35.3249,2.1668],[35.3403,2.125],[35.3658,2.0362],[35.3749,1.9922],[35.3734,1.9662],[35.3792,1.948],[35.3654,1.9285],[35.4417,1.8519],[35.4594,1.8457],[35.4686,1.8305],[35.466,1.8086],[35.4785,1.7956],[35.5044,1.776],[35.5099,1.7639],[35.5249,1.7681],[35.5422,1.7665],[35.5704,1.7544],[35.5926,1.7523],[35.6021,1.7581],[35.6173,1.745],[35.6266,1.7471],[35.6568,1.738],[35.6705,1.7238],[35.6987,1.7079],[35.72,1.7071],[35.7553,1.6759],[35.7686,1.6685],[35.7919,1.6636],[36.0966,1.1694],[36.174,1.1709],[36.3169,0.9913],[36.3404,0.9931],[36.3499,0.9663],[36.3668,0.9559],[36.3822,0.9543],[36.3891,0.9407],[36.3859,0.9273],[36.3921,0.9188],[36.4178,0.9369],[36.4365,0.9606],[36.4485,0.9804],[36.4582,0.9773],[36.4586,0.9967],[36.4416,1.0429],[36.4438,1.0553],[36.4388,1.0807],[36.4388,1.1019],[36.4448,1.1134],[36.4341,1.1385],[36.4351,1.1562],[36.4423,1.1729],[36.4186,1.1866],[36.399,1.1737],[36.39,1.1789],[36.398,1.2068],[36.394,1.22],[36.4216,1.2367],[36.4134,1.2467],[36.3965,1.2554],[36.3877,1.2656],[36.4082,1.2791],[36.4229,1.2671],[36.4301,1.2673],[36.444,1.2526],[36.4535,1.2544],[36.4508,1.2726],[36.4346,1.293],[36.4034,1.3005],[36.3957,1.308],[36.4102,1.3286],[36.4211,1.3369],[36.4206,1.3458],[36.4351,1.3521],[36.4376,1.36],[36.4582,1.3687],[36.4665,1.3986],[36.455,1.3981],[36.445,1.4121],[36.4316,1.4101],[36.4122,1.4221],[36.3895,1.445],[36.3559,1.436],[36.3479,1.4388],[36.3227,1.4679],[36.3053,1.4689],[36.2941,1.4634],[36.2866,1.4699],[36.2976,1.4883],[36.2938,1.502],[36.2998,1.5421],[36.3312,1.571],[36.3578,1.5708],[36.3578,1.5877],[36.3668,1.5957],[36.3748,1.5848],[36.3693,1.5636],[36.372,1.5479],[36.3835,1.5312],[36.3955,1.5242],[36.4099,1.5611],[36.4313,1.5845],[36.4311,1.598],[36.4426,1.6181],[36.462,1.6191],[36.4705,1.6433],[36.4685,1.6525],[36.4769,1.6754],[36.4854,1.6829],[36.4842,1.7028],[36.4989,1.7061],[36.5056,1.7312],[36.5185,1.741],[36.5253,1.7549],[36.5193,1.7666],[36.5208,1.7851],[36.5293,1.7998],[36.5136,1.816],[36.5215,1.8319],[36.523,1.8464],[36.5098,1.8596],[36.5121,1.8795],[36.5233,1.8832],[36.5352,1.8949],[36.5395,1.9266],[36.5345,1.9635],[36.5461,2.0071],[36.5445,2.0293],[36.5677,2.0569],[36.5645,2.1059],[36.5803,2.1232],[36.5859,2.1442],[36.5935,2.146],[36.6097,2.1626],[36.6362,2.1639],[36.6563,2.1734],[36.6866,2.1957],[36.6992,2.1979],[36.6996,2.2168],[36.7107,2.2232],[36.7093,2.2395],[36.7138,2.2523],[36.7073,2.2597],[36.7228,2.275],[36.7237,2.301],[36.601,2.36],[36.6009,2.4057],[36.5924,2.412],[36.5591,2.3971],[36.5404,2.4046],[36.5225,2.4507],[36.5276,2.4744],[36.5285,2.5222],[36.5231,2.5261],[36.5139,2.5589],[36.4931,2.5743],[36.473,2.6005],[36.4716,2.6086],[36.4536,2.611],[36.4368,2.6335],[36.4332,2.6533],[36.4348,2.6865],[36.4457,2.7028],[36.4308,2.714],[36.4197,2.7374],[36.4175,2.762],[36.3984,2.7925],[36.3752,2.8425],[36.3588,2.8608],[36.3446,2.8628],[36.2973,2.8874],[36.283,2.8902],[36.2701,2.9055],[36.2602,2.936],[36.2592,2.9497],[36.2463,2.9492],[36.2358,2.9561],[36.2004,2.962],[36.1926,2.9678],[36.1637,2.9667],[36.1384,2.9693],[36.1356,2.9795],[36.1234,2.9813],[36.128,3.0039],[36.137,3.015],[36.1428,3.056],[36.1413,3.073],[36.1527,3.0825],[36.1506,3.0981],[36.1531,3.1241],[36.151,3.1377],[36.1413,3.1574],[36.1526,3.1899],[36.1542,3.2146],[36.1423,3.2095],[36.1229,3.214],[36.1143,3.2211],[36.0719,3.2287],[36.0521,3.2406],[36.0498,4.0566],[36.0506,4.4562]]]},"properties":{"countyId":"turkana","name":"Turkana"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[36.6009,2.4057],[36.6089,2.3966],[36.619,2.3998],[36.6205,2.4124],[36.6434,2.4058],[36.6432,2.4177],[36.6562,2.4198],[36.6711,2.4455],[36.688,2.4589],[36.6968,2.4543],[36.703,2.4774],[36.7022,2.4975],[36.7077,2.5085],[36.7567,2.5161],[36.8435,2.2748],[36.8658,2.2538],[36.8967,2.1925],[36.9035,2.1553],[36.9153,2.1257],[36.9127,2.1],[36.9182,2.0835],[36.9209,2.0574],[36.916,2.0216],[36.9253,2.0169],[36.95,2.0251],[37.0059,1.9855],[37.0421,1.9825],[37.0908,1.9834],[37.1495,1.9683],[37.1768,1.958],[37.1899,1.9314],[37.2199,1.907],[37.2321,1.9002],[37.241,1.8858],[37.2667,1.8776],[37.3061,1.7655],[37.3505,1.7421],[37.443,1.5874],[37.4692,1.5543],[37.4999,1.5012],[37.5578,1.3962],[37.5698,1.3885],[37.5816,1.3723],[37.5993,1.3906],[37.6087,1.3753],[37.6215,1.3769],[37.6467,1.3992],[37.6559,1.3966],[37.6836,1.399],[37.71,1.4072],[37.7374,1.4076],[37.7479,1.4134],[37.7786,1.4121],[37.7936,1.4141],[37.8183,1.423],[37.8434,1.4262],[37.8521,1.4591],[37.9506,1.387],[37.9453,1.2629],[38.3397,1.5774],[38.3832,1.7613],[38.9626,2.0974],[38.9512,2.1144],[38.9358,2.1612],[38.9383,2.2148],[38.9261,2.2829],[38.9361,2.3179],[38.9316,2.344],[38.9343,2.3743],[38.9309,2.3806],[38.9282,2.412],[38.9145,2.4408],[38.902,2.4794],[38.8886,2.5426],[38.968,2.5632],[38.9817,2.5712],[39.0434,2.676],[39.0362,2.6869],[39.046,2.7001],[39.0525,2.7265],[39.066,2.7376],[39.0651,2.8823],[39.1118,2.8833],[39.1172,2.9161],[39.1236,2.9313],[39.1396,2.941],[39.1533,2.9547],[39.2022,2.9569],[39.2481,2.9891],[39.2494,2.9959],[39.2893,3.0353],[39.324,3.0528],[39.3468,3.0701],[39.3424,3.2484],[39.3392,3.274],[39.3282,3.2887],[39.3259,3.3146],[39.3135,3.4068],[39.3017,3.4266],[39.2998,3.4407],[39.3052,3.4568],[39.3181,3.472],[39.2951,3.4794],[39.2694,3.4727],[39.2327,3.4794],[39.2272,3.4831],[39.2012,3.4798],[39.1508,3.5055],[39.1062,3.5242],[39.0898,3.5405],[39.0543,3.523],[39.038,3.5301],[39.0227,3.5255],[39.0221,3.516],[39.0001,3.5211],[38.9803,3.5172],[38.964,3.5236],[38.9586,3.5089],[38.9043,3.5059],[38.8409,3.5282],[38.8381,3.5274],[38.7138,3.5656],[38.7117,3.5754],[38.6926,3.6051],[38.6879,3.6174],[38.6722,3.6154],[38.6763,3.6042],[38.6654,3.5872],[38.6113,3.6076],[38.5992,3.5999],[38.5761,3.6011],[38.5571,3.615],[38.5468,3.6396],[38.5343,3.6492],[38.5157,3.6446],[38.5223,3.6222],[38.5045,3.6178],[38.4476,3.5976],[38.3045,3.6078],[38.1811,3.6158],[38.1282,3.6008],[38.1128,3.6182],[38.0338,3.6842],[37.9896,3.7292],[37.9184,3.7685],[37.9076,3.7778],[37.799,3.8495],[37.7665,3.8695],[37.6518,3.9503],[37.6463,3.9578],[37.5851,3.9987],[37.4934,4.0647],[37.4277,4.1077],[37.4203,4.1113],[37.2865,4.199],[37.138,4.2954],[37.132,4.2938],[37.1136,4.3073],[37.0905,4.3431],[37.0638,4.3526],[37.0322,4.3857],[37.0205,4.3719],[37.0043,4.3781],[36.9871,4.3925],[36.9083,4.4251],[36.8783,4.4318],[36.8426,4.45],[36.679,4.4414],[36.6603,4.4419],[36.6433,4.4536],[36.6252,4.4541],[36.5459,4.4446],[36.2627,4.4509],[36.2458,4.4575],[36.2318,4.4512],[36.0506,4.4562],[36.0498,4.0566],[36.0521,3.2406],[36.0719,3.2287],[36.1143,3.2211],[36.1229,3.214],[36.1423,3.2095],[36.1542,3.2146],[36.1526,3.1899],[36.1413,3.1574],[36.151,3.1377],[36.1531,3.1241],[36.1506,3.0981],[36.1527,3.0825],[36.1413,3.073],[36.1428,3.056],[36.137,3.015],[36.128,3.0039],[36.1234,2.9813],[36.1356,2.9795],[36.1384,2.9693],[36.1637,2.9667],[36.1926,2.9678],[36.2004,2.962],[36.2358,2.9561],[36.2463,2.9492],[36.2592,2.9497],[36.2602,2.936],[36.2701,2.9055],[36.283,2.8902],[36.2973,2.8874],[36.3446,2.8628],[36.3588,2.8608],[36.3752,2.8425],[36.3984,2.7925],[36.4175,2.762],[36.4197,2.7374],[36.4308,2.714],[36.4457,2.7028],[36.4348,2.6865],[36.4332,2.6533],[36.4368,2.6335],[36.4536,2.611],[36.4716,2.6086],[36.473,2.6005],[36.4931,2.5743],[36.5139,2.5589],[36.5231,2.5261],[36.5285,2.5222],[36.5276,2.4744],[36.5225,2.4507],[36.5404,2.4046],[36.5591,2.3971],[36.5924,2.412],[36.6009,2.4057]]]},"properties":{"countyId":"marsabit","name":"Marsabit"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[40.992,2.1792],[40.9925,2.2519],[40.9926,2.5232],[40.9925,2.8248],[41.1855,3.0142],[41.3283,3.1537],[41.5263,3.4348],[41.6442,3.6014],[41.7996,3.8233],[41.8914,3.9524],[41.9063,3.9764],[41.8985,3.9811],[41.8547,3.9515],[41.8276,3.9527],[41.8209,3.9587],[41.798,3.9599],[41.7995,3.9722],[41.7796,3.982],[41.7742,3.9744],[41.7553,3.9746],[41.7548,3.9824],[41.7319,3.99],[41.7056,3.9877],[41.6706,3.9688],[41.6553,3.9667],[41.6433,3.9792],[41.6263,3.9844],[41.6174,3.9748],[41.5959,3.9715],[41.5797,3.9738],[41.5655,3.9698],[41.551,3.9854],[41.5267,3.9741],[41.5217,3.9609],[41.5127,3.9552],[41.5011,3.9697],[41.4711,3.9559],[41.4633,3.9605],[41.4386,3.9508],[41.4194,3.95],[41.3974,3.9656],[41.3811,3.9603],[41.377,3.9534],[41.3542,3.9589],[41.3506,3.9499],[41.3276,3.942],[41.3121,3.948],[41.281,3.948],[41.2641,3.9557],[41.2532,3.9525],[41.2382,3.9603],[41.2152,3.9534],[41.2069,3.9357],[41.1957,3.9368],[41.155,3.9581],[41.1306,3.9672],[41.1318,3.9744],[41.1153,3.9888],[41.1013,3.9918],[41.0981,4.0098],[41.0713,4.0279],[41.0617,4.0505],[41.0529,4.056],[41.0397,4.0771],[41.0325,4.0751],[41.0189,4.0848],[40.9996,4.1123],[40.9819,4.1138],[40.9729,4.1301],[40.9582,4.1426],[40.9073,4.1568],[40.8996,4.1838],[40.887,4.1933],[40.887,4.2118],[40.8679,4.2284],[40.8568,4.2287],[40.848,4.249],[40.8241,4.2537],[40.8051,4.2656],[40.7936,4.2684],[40.7822,4.2828],[40.7579,4.2817],[40.7459,4.2641],[40.7273,4.252],[40.7108,4.2525],[40.6932,4.2413],[40.4017,4.1227],[40.3874,4.116],[40.206,4.0422],[40.1901,4.0454],[40.1836,4.0323],[40.1175,3.9971],[39.8677,3.8675],[39.7753,3.6681],[39.7868,3.3335],[40.0351,3.2296],[40.0442,3.2242],[40.1404,3.1199],[40.1827,3.0729],[40.2697,2.9706],[40.4915,2.8681],[40.4982,2.8323],[40.4951,2.817],[40.5037,2.8097],[40.5024,2.7961],[40.5194,2.7709],[40.5205,2.7397],[40.5009,2.7223],[40.5212,2.6958],[40.528,2.6642],[40.5326,2.6594],[40.5521,2.6084],[40.5539,2.5933],[40.5674,2.5647],[40.5814,2.5498],[40.5813,2.5287],[40.5958,2.5144],[40.5914,2.5032],[40.6032,2.4928],[40.6035,2.4845],[40.6155,2.4629],[40.6418,2.4355],[40.6596,2.4305],[40.6649,2.4217],[40.6681,2.3905],[40.6817,2.3703],[40.6929,2.3657],[40.7097,2.349],[40.7205,2.3272],[40.7378,2.3147],[40.7571,2.3142],[40.7791,2.3051],[40.7984,2.2868],[40.816,2.277],[40.8377,2.2753],[40.8432,2.263],[40.8763,2.2246],[40.9136,2.1929],[40.9375,2.18],[40.9625,2.1763],[40.992,2.1792]]]},"properties":{"countyId":"mandera","name":"Mandera"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[38.9626,2.0974],[38.9853,2.0696],[38.9847,2.0523],[38.9918,2.0441],[38.9896,2.0272],[38.9956,2.0078],[39.0197,1.9774],[39.0351,1.9671],[39.0542,1.9336],[39.0838,1.8991],[39.102,1.89],[39.1121,1.8779],[39.1311,1.8662],[39.1458,1.8366],[39.144,1.8304],[39.1701,1.7911],[39.1803,1.7534],[39.2138,1.6974],[39.2319,1.6938],[39.2854,1.6675],[39.3083,1.6545],[39.3286,1.6339],[39.3453,1.626],[39.3791,1.5786],[39.3948,1.5652],[39.3989,1.5542],[39.4149,1.5509],[39.4385,1.5295],[39.4472,1.5272],[39.2743,1.4678],[39.3424,1.2895],[39.3978,1.1463],[39.4608,1.0003],[39.4607,0.9947],[39.4804,0.9794],[39.4915,0.964],[39.4979,0.9339],[39.5279,0.8685],[39.5457,0.8157],[39.5528,0.787],[39.5689,0.7486],[39.5885,0.719],[39.615,0.6841],[39.6467,0.657],[39.6544,0.6326],[39.6766,0.5977],[39.6994,0.5691],[39.7243,0.5436],[39.7321,0.527],[39.7627,0.5115],[39.777,0.4955],[39.7992,0.483],[39.8207,0.4821],[39.8526,0.4759],[39.8566,0.4692],[39.8761,0.4582],[39.9025,0.4625],[39.9439,0.4297],[39.9699,0.4141],[40.013,0.3989],[40.0484,0.3963],[40.0596,0.3926],[40.1282,0.3426],[40.1633,0.3239],[40.1781,0.3099],[40.2111,0.272],[40.2237,0.2601],[40.2589,0.2373],[40.3071,0.2156],[40.3299,0.2],[40.366,0.1982],[40.3832,0.1938],[40.3999,0.1843],[40.4297,0.1902],[40.4484,0.1862],[40.4817,0.1882],[40.4966,0.198],[40.5066,0.1924],[40.514,0.2082],[40.5309,0.2255],[40.5407,0.2268],[40.5617,0.2167],[40.5873,0.2158],[40.5969,0.2265],[40.6121,0.2328],[40.6484,0.2326],[40.6829,0.26],[40.683,0.2698],[40.6945,0.2781],[40.709,0.3101],[40.7186,0.3217],[40.7373,0.3273],[40.7551,0.3459],[40.7745,0.3546],[40.8433,0.3709],[40.886,0.3924],[40.9202,0.425],[40.9456,0.4369],[40.9612,0.4476],[40.9755,0.452],[40.9918,0.4644],[40.9923,0.6033],[40.9923,0.858],[40.9926,1.018],[40.9923,1.1705],[40.9922,1.4428],[40.9921,1.7101],[40.9904,1.9473],[40.992,2.1792],[40.9625,2.1763],[40.9375,2.18],[40.9136,2.1929],[40.8763,2.2246],[40.8432,2.263],[40.8377,2.2753],[40.816,2.277],[40.7984,2.2868],[40.7791,2.3051],[40.7571,2.3142],[40.7378,2.3147],[40.7205,2.3272],[40.7097,2.349],[40.6929,2.3657],[40.6817,2.3703],[40.6681,2.3905],[40.6649,2.4217],[40.6596,2.4305],[40.6418,2.4355],[40.6155,2.4629],[40.6035,2.4845],[40.6032,2.4928],[40.5914,2.5032],[40.5958,2.5144],[40.5813,2.5287],[40.5814,2.5498],[40.5674,2.5647],[40.5539,2.5933],[40.5521,2.6084],[40.5326,2.6594],[40.528,2.6642],[40.5212,2.6958],[40.5009,2.7223],[40.5205,2.7397],[40.5194,2.7709],[40.5024,2.7961],[40.5037,2.8097],[40.4951,2.817],[40.4982,2.8323],[40.4915,2.8681],[40.2697,2.9706],[40.1827,3.0729],[40.1404,3.1199],[40.0442,3.2242],[40.0351,3.2296],[39.7868,3.3335],[39.7753,3.6681],[39.7659,3.6611],[39.6094,3.5011],[39.553,3.4661],[39.5403,3.4728],[39.5253,3.4666],[39.5015,3.4701],[39.4867,3.4605],[39.4665,3.4603],[39.4566,3.456],[39.4456,3.4607],[39.4313,3.4576],[39.3763,3.4682],[39.3359,3.4663],[39.3181,3.472],[39.3052,3.4568],[39.2998,3.4407],[39.3017,3.4266],[39.3135,3.4068],[39.3259,3.3146],[39.3282,3.2887],[39.3392,3.274],[39.3424,3.2484],[39.3468,3.0701],[39.324,3.0528],[39.2893,3.0353],[39.2494,2.9959],[39.2481,2.9891],[39.2022,2.9569],[39.1533,2.9547],[39.1396,2.941],[39.1236,2.9313],[39.1172,2.9161],[39.1118,2.8833],[39.0651,2.8823],[39.066,2.7376],[39.0525,2.7265],[39.046,2.7001],[39.0362,2.6869],[39.0434,2.676],[38.9817,2.5712],[38.968,2.5632],[38.8886,2.5426],[38.902,2.4794],[38.9145,2.4408],[38.9282,2.412],[38.9309,2.3806],[38.9343,2.3743],[38.9316,2.344],[38.9361,2.3179],[38.9261,2.2829],[38.9383,2.2148],[38.9358,2.1612],[38.9512,2.1144],[38.9626,2.0974]]]},"properties":{"countyId":"wajir","name":"Wajir"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[36.3921,0.9188],[36.4024,0.9005],[36.4169,0.9025],[36.4296,0.8839],[36.4455,0.8716],[36.4541,0.8726],[36.4888,0.845],[36.4824,0.8135],[36.6695,0.8133],[36.6872,0.8175],[36.7084,0.8144],[36.7347,0.825],[36.7561,0.8584],[36.7731,0.8656],[36.7934,0.8694],[36.8156,0.8559],[36.8201,0.8382],[36.832,0.8135],[36.8345,0.7998],[36.8567,0.7635],[36.8658,0.7377],[36.8811,0.7332],[36.8969,0.7403],[36.9087,0.7368],[36.9316,0.7434],[36.9663,0.7421],[37.0031,0.7502],[37.042,0.7643],[37.0569,0.7718],[37.0707,0.7669],[37.0732,0.7796],[37.1038,0.7875],[37.1244,0.7781],[37.1366,0.7595],[37.1524,0.7595],[37.1699,0.7427],[37.2005,0.7464],[37.2199,0.7394],[37.248,0.7634],[37.2574,0.7636],[37.2731,0.7458],[37.2887,0.7369],[37.3008,0.7197],[37.3137,0.6864],[37.3263,0.6684],[37.3331,0.649],[37.3417,0.6467],[37.3526,0.6223],[37.3538,0.6013],[37.3897,0.5769],[37.4291,0.5831],[37.447,0.5804],[37.4624,0.5864],[37.4895,0.5893],[37.4923,0.5762],[37.5082,0.5694],[37.5311,0.5654],[37.5445,0.5777],[37.5574,0.571],[37.5832,0.5746],[37.5825,0.5874],[37.6073,0.5922],[37.6181,0.5998],[37.6351,0.5997],[37.6383,0.6211],[37.6504,0.6322],[37.666,0.6332],[37.6812,0.6426],[37.6907,0.6631],[37.7091,0.6672],[37.7288,0.6565],[37.7467,0.6762],[37.7578,0.6726],[37.7739,0.678],[37.7896,0.6722],[37.8321,0.6798],[37.8446,0.6896],[37.8464,0.7115],[37.867,0.7267],[37.8768,0.7442],[37.8885,0.7388],[37.9126,0.712],[37.9363,0.7303],[37.9404,0.7388],[37.9721,0.7598],[37.9882,0.7773],[38.0155,0.797],[38.0468,0.7844],[38.05,0.7786],[38.0809,0.7814],[38.0475,0.805],[38.0308,1.0851],[37.9482,1.1943],[37.9453,1.2629],[37.9506,1.387],[37.8521,1.4591],[37.8434,1.4262],[37.8183,1.423],[37.7936,1.4141],[37.7786,1.4121],[37.7479,1.4134],[37.7374,1.4076],[37.71,1.4072],[37.6836,1.399],[37.6559,1.3966],[37.6467,1.3992],[37.6215,1.3769],[37.6087,1.3753],[37.5993,1.3906],[37.5816,1.3723],[37.5698,1.3885],[37.5578,1.3962],[37.4999,1.5012],[37.4692,1.5543],[37.443,1.5874],[37.3505,1.7421],[37.3061,1.7655],[37.2667,1.8776],[37.241,1.8858],[37.2321,1.9002],[37.2199,1.907],[37.1899,1.9314],[37.1768,1.958],[37.1495,1.9683],[37.0908,1.9834],[37.0421,1.9825],[37.0059,1.9855],[36.95,2.0251],[36.9253,2.0169],[36.916,2.0216],[36.9209,2.0574],[36.9182,2.0835],[36.9127,2.1],[36.9153,2.1257],[36.9035,2.1553],[36.8967,2.1925],[36.8658,2.2538],[36.8435,2.2748],[36.7567,2.5161],[36.7077,2.5085],[36.7022,2.4975],[36.703,2.4774],[36.6968,2.4543],[36.688,2.4589],[36.6711,2.4455],[36.6562,2.4198],[36.6432,2.4177],[36.6434,2.4058],[36.6205,2.4124],[36.619,2.3998],[36.6089,2.3966],[36.6009,2.4057],[36.601,2.36],[36.7237,2.301],[36.7228,2.275],[36.7073,2.2597],[36.7138,2.2523],[36.7093,2.2395],[36.7107,2.2232],[36.6996,2.2168],[36.6992,2.1979],[36.6866,2.1957],[36.6563,2.1734],[36.6362,2.1639],[36.6097,2.1626],[36.5935,2.146],[36.5859,2.1442],[36.5803,2.1232],[36.5645,2.1059],[36.5677,2.0569],[36.5445,2.0293],[36.5461,2.0071],[36.5345,1.9635],[36.5395,1.9266],[36.5352,1.8949],[36.5233,1.8832],[36.5121,1.8795],[36.5098,1.8596],[36.523,1.8464],[36.5215,1.8319],[36.5136,1.816],[36.5293,1.7998],[36.5208,1.7851],[36.5193,1.7666],[36.5253,1.7549],[36.5185,1.741],[36.5056,1.7312],[36.4989,1.7061],[36.4842,1.7028],[36.4854,1.6829],[36.4769,1.6754],[36.4685,1.6525],[36.4705,1.6433],[36.462,1.6191],[36.4426,1.6181],[36.4311,1.598],[36.4313,1.5845],[36.4099,1.5611],[36.3955,1.5242],[36.3835,1.5312],[36.372,1.5479],[36.3693,1.5636],[36.3748,1.5848],[36.3668,1.5957],[36.3578,1.5877],[36.3578,1.5708],[36.3312,1.571],[36.2998,1.5421],[36.2938,1.502],[36.2976,1.4883],[36.2866,1.4699],[36.2941,1.4634],[36.3053,1.4689],[36.3227,1.4679],[36.3479,1.4388],[36.3559,1.436],[36.3895,1.445],[36.4122,1.4221],[36.4316,1.4101],[36.445,1.4121],[36.455,1.3981],[36.4665,1.3986],[36.4582,1.3687],[36.4376,1.36],[36.4351,1.3521],[36.4206,1.3458],[36.4211,1.3369],[36.4102,1.3286],[36.3957,1.308],[36.4034,1.3005],[36.4346,1.293],[36.4508,1.2726],[36.4535,1.2544],[36.444,1.2526],[36.4301,1.2673],[36.4229,1.2671],[36.4082,1.2791],[36.3877,1.2656],[36.3965,1.2554],[36.4134,1.2467],[36.4216,1.2367],[36.394,1.22],[36.398,1.2068],[36.39,1.1789],[36.399,1.1737],[36.4186,1.1866],[36.4423,1.1729],[36.4351,1.1562],[36.4341,1.1385],[36.4448,1.1134],[36.4388,1.1019],[36.4388,1.0807],[36.4438,1.0553],[36.4416,1.0429],[36.4586,0.9967],[36.4582,0.9773],[36.4485,0.9804],[36.4365,0.9606],[36.4178,0.9369],[36.3921,0.9188]]]},"properties":{"countyId":"samburu","name":"Samburu"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[37.9453,1.2629],[37.9482,1.1943],[38.0308,1.0851],[38.0475,0.805],[38.0809,0.7814],[38.05,0.7786],[38.0468,0.7844],[38.0155,0.797],[37.9882,0.7773],[37.9721,0.7598],[37.9404,0.7388],[37.9363,0.7303],[37.9126,0.712],[37.8885,0.7388],[37.8768,0.7442],[37.867,0.7267],[37.8464,0.7115],[37.8446,0.6896],[37.8321,0.6798],[37.7896,0.6722],[37.7739,0.678],[37.7578,0.6726],[37.7467,0.6762],[37.7288,0.6565],[37.7091,0.6672],[37.6907,0.6631],[37.6812,0.6426],[37.666,0.6332],[37.6504,0.6322],[37.6383,0.6211],[37.6351,0.5997],[37.6181,0.5998],[37.6073,0.5922],[37.5825,0.5874],[37.5832,0.5746],[37.5574,0.571],[37.5445,0.5777],[37.5311,0.5654],[37.5082,0.5694],[37.4923,0.5762],[37.4895,0.5893],[37.4624,0.5864],[37.447,0.5804],[37.4291,0.5831],[37.3897,0.5769],[37.3538,0.6013],[37.3526,0.6223],[37.3417,0.6467],[37.3331,0.649],[37.3263,0.6684],[37.3137,0.6864],[37.3008,0.7197],[37.2887,0.7369],[37.2731,0.7458],[37.2574,0.7636],[37.248,0.7634],[37.2199,0.7394],[37.2005,0.7464],[37.1699,0.7427],[37.1524,0.7595],[37.1366,0.7595],[37.1244,0.7781],[37.1038,0.7875],[37.0732,0.7796],[37.0707,0.7669],[37.0569,0.7718],[37.042,0.7643],[37.0031,0.7502],[36.9663,0.7421],[36.9316,0.7434],[36.9273,0.7289],[36.9257,0.6871],[36.9219,0.661],[36.9118,0.6572],[36.9096,0.6327],[36.8901,0.6228],[36.8883,0.6104],[36.8752,0.6046],[36.8656,0.592],[36.8644,0.5658],[37.0719,0.5443],[37.2584,0.5248],[37.369,0.5116],[37.3611,0.5035],[37.3569,0.4655],[37.3489,0.4558],[37.3483,0.4402],[37.3537,0.4118],[37.3622,0.4076],[37.3769,0.3678],[37.3903,0.3549],[37.3937,0.3167],[37.3924,0.297],[37.4278,0.2978],[37.4642,0.283],[37.5371,0.264],[37.5477,0.2791],[37.5475,0.3107],[37.5555,0.3278],[37.5808,0.3275],[37.5922,0.3401],[37.6032,0.3607],[37.5988,0.4015],[37.5856,0.4017],[37.5814,0.42],[37.5816,0.463],[37.5865,0.4812],[37.826,0.5618],[38.0613,0.6674],[38.0946,0.5631],[38.1765,0.3301],[38.1959,0.3225],[38.1965,0.2287],[38.2543,0.1996],[38.264,0.185],[38.2836,0.1738],[38.2978,0.1611],[38.3069,0.132],[38.3085,0.1131],[38.3185,0.109],[38.3299,0.0938],[38.3245,0.082],[38.3313,0.0726],[38.3487,0.0632],[38.3453,0.0482],[38.3576,0.04],[38.3554,0.0279],[38.3795,-0.0011],[38.3951,-0.0078],[38.4023,-0.0172],[38.4066,-0.0409],[38.4134,-0.0515],[38.4115,-0.0623],[38.4207,-0.0693],[38.4342,-0.0748],[38.454,-0.0842],[38.4811,-0.0755],[38.4909,-0.0587],[38.5199,-0.0627],[38.5419,-0.0406],[38.5502,-0.0174],[38.5699,-0.0174],[38.6041,-0.0327],[38.6156,-0.0302],[38.6384,-0.0515],[38.657,-0.0451],[38.6827,-0.0538],[38.6984,-0.0491],[38.7172,-0.0609],[38.7401,-0.0694],[38.7594,-0.0721],[38.7687,-0.0687],[38.7667,-0.055],[38.7508,-0.0295],[38.7391,0.0062],[38.7401,0.0146],[38.7311,0.051],[38.7292,0.0838],[38.7323,0.0953],[38.7314,0.1214],[38.7376,0.1503],[38.7541,0.169],[38.7568,0.184],[38.7493,0.2176],[38.7322,0.2806],[38.6952,0.423],[38.6881,0.4544],[38.6803,0.4715],[38.6766,0.4936],[38.6617,0.5091],[38.6918,0.5101],[38.7034,0.5061],[38.7186,0.5105],[38.7244,0.5245],[38.736,0.5181],[38.7529,0.5225],[38.763,0.5116],[38.7857,0.5268],[38.8245,0.579],[38.8598,0.5993],[38.8747,0.5946],[38.9023,0.5963],[38.9263,0.6067],[38.9398,0.6284],[38.9781,0.6213],[38.986,0.6261],[39.0097,0.6244],[39.0201,0.6408],[39.0255,0.6632],[39.0334,0.6648],[39.0484,0.6833],[39.0572,0.6858],[39.0839,0.6753],[39.0973,0.6804],[39.1005,0.6889],[39.1423,0.6925],[39.1476,0.7063],[39.1733,0.7194],[39.1772,0.7463],[39.1953,0.7833],[39.2285,0.8267],[39.2351,0.8434],[39.3129,0.925],[39.3603,0.9544],[39.4352,0.9837],[39.4607,0.9947],[39.4608,1.0003],[39.3978,1.1463],[39.3424,1.2895],[39.2743,1.4678],[39.4472,1.5272],[39.4385,1.5295],[39.4149,1.5509],[39.3989,1.5542],[39.3948,1.5652],[39.3791,1.5786],[39.3453,1.626],[39.3286,1.6339],[39.3083,1.6545],[39.2854,1.6675],[39.2319,1.6938],[39.2138,1.6974],[39.1803,1.7534],[39.1701,1.7911],[39.144,1.8304],[39.1458,1.8366],[39.1311,1.8662],[39.1121,1.8779],[39.102,1.89],[39.0838,1.8991],[39.0542,1.9336],[39.0351,1.9671],[39.0197,1.9774],[38.9956,2.0078],[38.9896,2.0272],[38.9918,2.0441],[38.9847,2.0523],[38.9853,2.0696],[38.9626,2.0974],[38.3832,1.7613],[38.3397,1.5774],[37.9453,1.2629]]]},"properties":{"countyId":"isiolo","name":"Isiolo"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[39.4607,0.9947],[39.4352,0.9837],[39.3603,0.9544],[39.3129,0.925],[39.2351,0.8434],[39.2285,0.8267],[39.1953,0.7833],[39.1772,0.7463],[39.1733,0.7194],[39.1476,0.7063],[39.1423,0.6925],[39.1005,0.6889],[39.0973,0.6804],[39.0839,0.6753],[39.0572,0.6858],[39.0484,0.6833],[39.0334,0.6648],[39.0255,0.6632],[39.0201,0.6408],[39.0097,0.6244],[38.986,0.6261],[38.9781,0.6213],[38.9398,0.6284],[38.9263,0.6067],[38.9023,0.5963],[38.8747,0.5946],[38.8598,0.5993],[38.8245,0.579],[38.7857,0.5268],[38.763,0.5116],[38.7529,0.5225],[38.736,0.5181],[38.7244,0.5245],[38.7186,0.5105],[38.7034,0.5061],[38.6918,0.5101],[38.6617,0.5091],[38.6766,0.4936],[38.6803,0.4715],[38.6881,0.4544],[38.6952,0.423],[38.7322,0.2806],[38.7493,0.2176],[38.7568,0.184],[38.7541,0.169],[38.7376,0.1503],[38.7314,0.1214],[38.7323,0.0953],[38.7292,0.0838],[38.7311,0.051],[38.7401,0.0146],[38.7391,0.0062],[38.7508,-0.0295],[38.7667,-0.055],[38.7687,-0.0687],[38.7884,-0.0794],[38.8106,-0.0842],[38.8288,-0.0922],[38.8604,-0.0917],[38.8832,-0.0963],[38.9007,-0.0954],[38.9221,-0.0871],[38.9398,-0.099],[38.9548,-0.086],[38.967,-0.0823],[38.97,-0.0612],[39.0085,-0.0548],[39.0232,-0.0428],[39.0326,-0.0522],[39.0493,-0.0526],[39.0668,-0.0473],[39.0741,-0.0648],[39.0979,-0.088],[39.1017,-0.0982],[39.1316,-0.1188],[39.1341,-0.1297],[39.1658,-0.1271],[39.2014,-0.1427],[39.2151,-0.132],[39.2277,-0.1306],[39.2557,-0.1452],[39.2758,-0.1371],[39.3062,-0.1393],[39.3144,-0.1335],[39.3278,-0.1474],[39.3404,-0.1669],[39.3543,-0.1612],[39.3641,-0.1641],[39.3841,-0.1905],[39.4273,-0.1898],[39.4449,-0.2098],[39.4544,-0.2117],[39.4712,-0.2267],[39.4771,-0.2415],[39.4979,-0.2483],[39.5176,-0.284],[39.5122,-0.2945],[39.5477,-0.2954],[39.5628,-0.3292],[39.5847,-0.3405],[39.5966,-0.3605],[39.5981,-0.3943],[39.6038,-0.4098],[39.6133,-0.4088],[39.6103,-0.4373],[39.6349,-0.4567],[39.6291,-0.4698],[39.6306,-0.4899],[39.64,-0.4955],[39.6475,-0.5165],[39.6686,-0.5316],[39.663,-0.5482],[39.6868,-0.5523],[39.6856,-0.5744],[39.6969,-0.5916],[39.7389,-0.594],[39.7662,-0.6112],[39.7769,-0.6146],[39.7696,-0.6339],[39.789,-0.6604],[39.7976,-0.6903],[39.8101,-0.7039],[39.8115,-0.7277],[39.8212,-0.739],[39.8155,-0.7651],[39.8422,-0.8061],[39.8432,-0.8469],[39.8573,-0.8475],[39.8519,-0.8684],[39.8586,-0.884],[39.8517,-0.8975],[39.861,-0.9145],[39.8607,-0.9261],[39.8785,-0.9367],[39.8688,-0.9475],[39.8915,-0.9907],[39.8857,-0.9951],[39.899,-1.0281],[39.9127,-1.0425],[39.9083,-1.0513],[39.9208,-1.0787],[39.9259,-1.0777],[39.9324,-1.1291],[39.9438,-1.1311],[39.9608,-1.1531],[39.9623,-1.1662],[39.9727,-1.1863],[39.9893,-1.2025],[39.9997,-1.2189],[39.996,-1.2283],[40.0084,-1.242],[40.0013,-1.2547],[40.0047,-1.2699],[39.9993,-1.2844],[39.9994,-1.3089],[40.0106,-1.3278],[40.001,-1.3481],[40.0096,-1.3654],[40.0125,-1.3816],[40.022,-1.401],[40.0245,-1.4221],[40.0343,-1.4326],[40.032,-1.4627],[40.0388,-1.4908],[40.0709,-1.4709],[40.0873,-1.4743],[40.1051,-1.5079],[40.1149,-1.5529],[40.1261,-1.5702],[40.1433,-1.5864],[40.154,-1.6078],[40.1601,-1.6536],[40.1578,-1.6941],[40.1708,-1.7239],[40.1691,-1.7355],[40.1579,-1.7617],[40.163,-1.8234],[40.1875,-1.8629],[40.1865,-1.8942],[40.1893,-1.9315],[40.186,-1.9598],[40.1976,-1.9838],[40.1964,-1.9978],[40.2046,-2.0153],[40.2079,-2.0329],[40.9029,-1.7145],[41.562,-1.6587],[41.5622,-1.5975],[40.9924,-0.8291],[40.991,-0.002],[40.9913,0.196],[40.9913,0.3441],[40.9918,0.4644],[40.9755,0.452],[40.9612,0.4476],[40.9456,0.4369],[40.9202,0.425],[40.886,0.3924],[40.8433,0.3709],[40.7745,0.3546],[40.7551,0.3459],[40.7373,0.3273],[40.7186,0.3217],[40.709,0.3101],[40.6945,0.2781],[40.683,0.2698],[40.6829,0.26],[40.6484,0.2326],[40.6121,0.2328],[40.5969,0.2265],[40.5873,0.2158],[40.5617,0.2167],[40.5407,0.2268],[40.5309,0.2255],[40.514,0.2082],[40.5066,0.1924],[40.4966,0.198],[40.4817,0.1882],[40.4484,0.1862],[40.4297,0.1902],[40.3999,0.1843],[40.3832,0.1938],[40.366,0.1982],[40.3299,0.2],[40.3071,0.2156],[40.2589,0.2373],[40.2237,0.2601],[40.2111,0.272],[40.1781,0.3099],[40.1633,0.3239],[40.1282,0.3426],[40.0596,0.3926],[40.0484,0.3963],[40.013,0.3989],[39.9699,0.4141],[39.9439,0.4297],[39.9025,0.4625],[39.8761,0.4582],[39.8566,0.4692],[39.8526,0.4759],[39.8207,0.4821],[39.7992,0.483],[39.777,0.4955],[39.7627,0.5115],[39.7321,0.527],[39.7243,0.5436],[39.6994,0.5691],[39.6766,0.5977],[39.6544,0.6326],[39.6467,0.657],[39.615,0.6841],[39.5885,0.719],[39.5689,0.7486],[39.5528,0.787],[39.5457,0.8157],[39.5279,0.8685],[39.4979,0.9339],[39.4915,0.964],[39.4804,0.9794],[39.4607,0.9947]]]},"properties":{"countyId":"garissa","name":"Garissa"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[38.3091,-0.0515],[38.2896,-0.0236],[38.2648,-0.0131],[38.2465,-0.019],[38.2304,-0.0059],[38.224,0.0118],[38.2056,0.0196],[38.1929,0.015],[38.1763,0.0265],[38.1603,0.0295],[38.1442,0.0446],[38.1136,0.0574],[38.1043,0.0477],[38.0886,0.043],[38.0835,0.0299],[38.0721,0.0265],[38.0427,0.0264],[38.0283,0.0514],[38.0154,0.0614],[37.9931,0.0689],[37.9602,0.0671],[37.9464,0.0463],[37.9567,0.0396],[37.9399,0.0274],[37.9376,0.0084],[37.9073,0.0069],[37.9,0.0102],[37.8917,-0.0186],[37.8541,-0.0118],[37.8483,-0.0304],[37.8624,-0.0689],[37.8495,-0.105],[37.8572,-0.121],[37.7966,-0.162],[37.7845,-0.1545],[37.7681,-0.1563],[37.7535,-0.1827],[37.7224,-0.2033],[37.6989,-0.2029],[37.6701,-0.2069],[37.6617,-0.2165],[37.626,-0.2049],[37.6134,-0.1943],[37.6029,-0.1945],[37.5908,-0.1833],[37.5275,-0.1815],[37.3078,-0.1511],[37.5538,-0.3599],[37.5712,-0.3631],[37.6018,-0.3831],[37.631,-0.3891],[37.662,-0.4212],[37.6828,-0.4263],[37.694,-0.4376],[37.712,-0.4423],[37.7209,-0.45],[37.7476,-0.4448],[37.7582,-0.4484],[37.785,-0.4463],[37.8146,-0.4272],[37.832,-0.4042],[37.8455,-0.4032],[37.8521,-0.389],[37.8661,-0.3819],[37.8735,-0.3493],[37.8912,-0.3459],[37.8897,-0.3641],[37.8966,-0.3765],[37.8913,-0.3933],[37.9089,-0.4137],[37.9211,-0.4144],[37.9254,-0.4271],[37.9365,-0.4273],[37.9512,-0.4256],[37.9646,-0.4116],[37.9778,-0.3548],[37.972,-0.3447],[37.9857,-0.3174],[37.984,-0.2996],[37.9931,-0.2853],[38.0003,-0.265],[38.027,-0.2686],[38.0457,-0.2753],[38.0879,-0.2738],[38.1025,-0.2784],[38.1133,-0.2753],[38.1354,-0.2562],[38.1421,-0.2406],[38.1622,-0.2353],[38.1635,-0.2218],[38.1819,-0.1893],[38.1871,-0.1503],[38.2069,-0.1422],[38.207,-0.128],[38.2204,-0.1036],[38.2503,-0.0841],[38.2714,-0.093],[38.2799,-0.0824],[38.3015,-0.0661],[38.3091,-0.0515]]]},"properties":{"countyId":"tharaka_nithi","name":"Tharaka-Nithi"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[38.4207,-0.0693],[38.4035,-0.0749],[38.3916,-0.0735],[38.379,-0.0838],[38.3469,-0.0614],[38.3268,-0.0633],[38.3091,-0.0515],[38.3015,-0.0661],[38.2799,-0.0824],[38.2714,-0.093],[38.2503,-0.0841],[38.2204,-0.1036],[38.207,-0.128],[38.2069,-0.1422],[38.1871,-0.1503],[38.1819,-0.1893],[38.1635,-0.2218],[38.1622,-0.2353],[38.1421,-0.2406],[38.1354,-0.2562],[38.1133,-0.2753],[38.1025,-0.2784],[38.0879,-0.2738],[38.0457,-0.2753],[38.027,-0.2686],[38.0003,-0.265],[37.9931,-0.2853],[37.984,-0.2996],[37.9857,-0.3174],[37.972,-0.3447],[37.9778,-0.3548],[37.9646,-0.4116],[37.9512,-0.4256],[37.9365,-0.4273],[37.929,-0.448],[37.9134,-0.4661],[37.9009,-0.4965],[37.8823,-0.5332],[37.8873,-0.5532],[37.8825,-0.5807],[37.9217,-0.6227],[37.9063,-0.6383],[37.893,-0.6447],[37.8948,-0.6803],[37.9039,-0.6847],[37.8986,-0.7034],[37.9119,-0.7076],[37.9155,-0.728],[37.9094,-0.7469],[37.891,-0.7664],[37.8925,-0.7779],[37.8806,-0.79],[37.8835,-0.802],[37.8706,-0.8096],[37.8455,-0.8098],[37.8478,-0.8209],[37.8414,-0.8435],[37.8323,-0.8518],[37.823,-0.8805],[37.8229,-0.8936],[37.8395,-0.9092],[37.8386,-0.919],[37.8507,-0.9311],[37.8468,-0.945],[37.8566,-0.9642],[37.8681,-0.9732],[37.8465,-0.995],[37.8495,-1.0047],[37.8467,-1.0413],[37.8303,-1.0679],[37.8191,-1.0708],[37.8069,-1.0973],[37.7965,-1.1271],[37.7382,-1.0775],[37.594,-1.0859],[37.5969,-1.1472],[37.6115,-1.142],[37.623,-1.1476],[37.6381,-1.1694],[37.6491,-1.1974],[37.6758,-1.2325],[37.6842,-1.2345],[37.6967,-1.269],[37.7127,-1.2909],[37.7316,-1.3401],[37.7486,-1.357],[37.7594,-1.3544],[37.7748,-1.3609],[37.8036,-1.3945],[37.8072,-1.4189],[37.8132,-1.4342],[37.8101,-1.4473],[37.7801,-1.4707],[37.7705,-1.4867],[37.7349,-1.4962],[37.7097,-1.4887],[37.6946,-1.4986],[37.7107,-1.5082],[37.7326,-1.5423],[37.7483,-1.5539],[37.7533,-1.5664],[37.7712,-1.5829],[37.7828,-1.6094],[37.8034,-1.6426],[37.8038,-1.6528],[37.8219,-1.6696],[37.8194,-1.6784],[37.8368,-1.6907],[37.8351,-1.7106],[37.8429,-1.7115],[37.8549,-1.7544],[37.8535,-1.7639],[37.8403,-1.7679],[37.8377,-1.7792],[37.8472,-1.7979],[37.8915,-1.842],[37.8834,-1.8518],[37.8979,-1.8678],[37.9068,-1.9042],[37.9162,-1.91],[37.9076,-1.9324],[37.9125,-1.9543],[37.9283,-1.9972],[37.9384,-2.0118],[37.9414,-2.0357],[37.9486,-2.0352],[37.952,-2.0569],[37.9584,-2.0717],[37.9524,-2.1331],[37.9604,-2.1405],[37.9628,-2.1653],[37.9972,-2.1531],[38.0211,-2.1478],[38.0263,-2.1609],[38.0451,-2.1661],[38.0578,-2.2055],[38.0671,-2.215],[38.0697,-2.2474],[38.0845,-2.2639],[38.1103,-2.2843],[38.1088,-2.2998],[38.1233,-2.3177],[38.146,-2.3208],[38.1743,-2.3384],[38.1871,-2.3394],[38.1992,-2.3531],[38.2107,-2.3541],[38.2217,-2.3981],[38.2361,-2.4087],[38.2453,-2.4092],[38.253,-2.4201],[38.2712,-2.4215],[38.2817,-2.4511],[38.2867,-2.4809],[38.301,-2.4984],[38.3103,-2.501],[38.3205,-2.5304],[38.3217,-2.5481],[38.3308,-2.5621],[38.3379,-2.5849],[38.3469,-2.5893],[38.3616,-2.6298],[38.3661,-2.6481],[38.382,-2.6634],[38.3885,-2.6909],[38.4133,-2.7506],[38.4198,-2.7586],[38.4308,-2.7859],[38.418,-2.8107],[38.4255,-2.8172],[38.431,-2.839],[38.4271,-2.8482],[38.445,-2.8682],[38.4441,-2.8802],[38.4542,-2.8845],[38.4745,-2.9284],[38.5046,-2.9648],[38.5191,-2.9748],[38.539,-2.9737],[38.5642,-2.9866],[38.5849,-2.9877],[38.5942,-2.9986],[38.6093,-3.0065],[38.6439,-3.0129],[38.6627,-3.0315],[38.6652,-3.0394],[38.7082,-3.0321],[38.7335,-3.0425],[38.7566,-3.0461],[38.7726,-3.0439],[38.8082,-3.0526],[38.8016,-3.0675],[38.8213,-3.0656],[38.8359,-3.0594],[38.8644,-3.0571],[38.8936,-3.0385],[38.9167,-3.0445],[38.9371,-3.0346],[38.9523,-3.0392],[38.9806,-3.0393],[38.9903,-3.0268],[39.0418,-3.0212],[39.0447,-3.031],[39.0608,-3.0407],[39.0751,-3.0411],[38.6265,-2.4105],[38.6456,-2.4178],[38.6844,-2.4133],[38.7116,-2.3974],[38.732,-2.378],[38.7332,-2.3701],[38.7692,-2.3525],[38.7809,-2.3537],[38.7952,-2.3397],[39.0151,-1.914],[38.9585,-1.7028],[38.9824,-1.6946],[38.9997,-1.6763],[38.9567,-1.078],[38.9534,-1.0318],[38.8298,-0.7602],[38.4342,-0.0748],[38.4207,-0.0693]]]},"properties":{"countyId":"kitui","name":"Kitui"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[37.8455,-0.8098],[37.8333,-0.8118],[37.8194,-0.8037],[37.8071,-0.8132],[37.7811,-0.8237],[37.7713,-0.8188],[37.7584,-0.8219],[37.7416,-0.7761],[37.6988,-0.7831],[37.6924,-0.7934],[37.6819,-0.7949],[37.6815,-0.8213],[37.6721,-0.8273],[37.6658,-0.8439],[37.6575,-0.8455],[37.636,-0.8369],[37.6274,-0.8499],[37.6065,-0.853],[37.5904,-0.861],[37.5875,-0.8763],[37.5625,-0.8733],[37.5461,-0.8815],[37.5337,-0.8938],[37.5344,-0.9101],[37.5178,-0.9124],[37.5173,-0.9019],[37.5043,-0.8973],[37.4967,-0.9049],[37.477,-0.8937],[37.4663,-0.8728],[37.447,-0.8703],[37.4427,-0.8638],[37.427,-0.8659],[37.3618,-0.8442],[37.3241,-0.8416],[37.3045,-0.8001],[37.286,-0.783],[37.2673,-0.7853],[37.2572,-0.8381],[37.2349,-0.8359],[37.2249,-0.8515],[37.2515,-0.8603],[37.2772,-0.8923],[37.3176,-0.9179],[37.3242,-0.9324],[37.3133,-0.9402],[37.3366,-0.9649],[37.354,-0.9458],[37.3662,-0.9624],[37.344,-0.9762],[37.3386,-0.9847],[37.3612,-0.9875],[37.4052,-1.0137],[37.42,-1.0351],[37.3895,-1.0573],[37.3627,-1.0949],[37.3407,-1.1132],[37.3151,-1.0919],[37.2979,-1.0713],[37.2804,-1.0659],[37.2679,-1.0677],[37.2449,-1.0799],[37.2319,-1.0754],[37.2128,-1.0793],[37.1898,-1.0973],[37.1752,-1.1198],[37.1865,-1.1386],[37.1798,-1.1583],[37.181,-1.1685],[37.1666,-1.188],[37.1551,-1.1966],[37.1594,-1.2065],[37.1524,-1.2246],[37.1344,-1.2335],[37.1208,-1.2351],[37.1105,-1.2464],[37.1025,-1.2737],[37.0769,-1.2855],[37.0763,-1.3031],[37.0248,-1.2919],[37.0026,-1.3007],[36.9951,-1.2816],[36.9728,-1.2894],[36.9828,-1.312],[36.9791,-1.3167],[36.9399,-1.3326],[36.9047,-1.3656],[36.9149,-1.3767],[36.9222,-1.3942],[36.9423,-1.4065],[36.9451,-1.4212],[36.9533,-1.4301],[36.9319,-1.4343],[36.8877,-1.4156],[36.876,-1.4794],[36.8826,-1.489],[36.9256,-1.4573],[36.9427,-1.4551],[36.9453,-1.4636],[36.9747,-1.4772],[36.969,-1.4918],[36.9724,-1.5014],[36.9618,-1.5144],[36.9582,-1.5411],[36.9661,-1.5528],[36.9795,-1.5578],[36.9922,-1.5761],[37.1094,-1.7322],[37.1252,-1.7418],[37.1403,-1.7375],[37.1461,-1.7536],[37.1573,-1.7654],[37.1601,-1.7802],[37.2068,-1.7754],[37.2205,-1.7696],[37.2444,-1.7357],[37.2636,-1.7583],[37.2806,-1.7693],[37.2928,-1.7524],[37.3019,-1.7532],[37.2868,-1.7183],[37.3116,-1.7002],[37.3192,-1.7081],[37.3458,-1.7041],[37.3738,-1.7051],[37.4127,-1.6891],[37.4083,-1.6838],[37.3711,-1.604],[37.3628,-1.5891],[37.3349,-1.5617],[37.3469,-1.5531],[37.3798,-1.5202],[37.4003,-1.5215],[37.4277,-1.5318],[37.4434,-1.5315],[37.4659,-1.5182],[37.4889,-1.5175],[37.5196,-1.5364],[37.5526,-1.5391],[37.5604,-1.5505],[37.579,-1.5645],[37.5966,-1.5509],[37.5984,-1.5611],[37.6181,-1.5673],[37.6307,-1.5886],[37.6405,-1.5872],[37.6422,-1.6101],[37.6596,-1.6451],[37.6807,-1.6261],[37.6841,-1.6115],[37.6822,-1.5859],[37.7006,-1.5829],[37.7114,-1.6049],[37.7182,-1.6085],[37.7339,-1.5951],[37.7339,-1.5754],[37.7533,-1.5664],[37.7483,-1.5539],[37.7326,-1.5423],[37.7107,-1.5082],[37.6946,-1.4986],[37.7097,-1.4887],[37.7349,-1.4962],[37.7705,-1.4867],[37.7801,-1.4707],[37.8101,-1.4473],[37.8132,-1.4342],[37.8072,-1.4189],[37.8036,-1.3945],[37.7748,-1.3609],[37.7594,-1.3544],[37.7486,-1.357],[37.7316,-1.3401],[37.7127,-1.2909],[37.6967,-1.269],[37.6842,-1.2345],[37.6758,-1.2325],[37.6491,-1.1974],[37.6381,-1.1694],[37.623,-1.1476],[37.6115,-1.142],[37.5969,-1.1472],[37.594,-1.0859],[37.7382,-1.0775],[37.7965,-1.1271],[37.8069,-1.0973],[37.8191,-1.0708],[37.8303,-1.0679],[37.8467,-1.0413],[37.8495,-1.0047],[37.8465,-0.995],[37.8681,-0.9732],[37.8566,-0.9642],[37.8468,-0.945],[37.8507,-0.9311],[37.8386,-0.919],[37.8395,-0.9092],[37.8229,-0.8936],[37.823,-0.8805],[37.8323,-0.8518],[37.8414,-0.8435],[37.8478,-0.8209],[37.8455,-0.8098]]]},"properties":{"countyId":"machakos","name":"Machakos"}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[37.7533,-1.5664],[37.7339,-1.5754],[37.7339,-1.5951],[37.7182,-1.6085],[37.7114,-1.6049],[37.7006,-1.5829],[37.6822,-1.5859],[37.6841,-1.6115],[37.6807,-1.6261],[37.6596,-1.6451],[37.6422,-1.6101],[37.6405,-1.5872],[37.6307,-1.5886],[37.6181,-1.5673],[37.5984,-1.5611],[37.5966,-1.5509],[37.579,-1.5645],[37.5604,-1.5505],[37.5526,-1.5391],[37.5196,-1.5364],[37.4889,-1.5175],[37.4659,-1.5182],[37.4434,-1.5315],[37.4277,-1.5318],[37.4003,-1.5215],[37.3798,-1.5202],[37.3469,-1.5531],[37.3349,-1.5617],[37.3628,-1.5891],[37.3711,-1.604],[37.4083,-1.6838],[37.4127,-1.6891],[37.3738,-1.7051],[37.3458,-1.7041],[37.3192,-1.7081],[37.3116,-1.7002],[37.2868,-1.7183],[37.3019,-1.7532],[37.2928,-1.7524],[37.2806,-1.7693],[37.2636,-1.7583],[37.2444,-1.7357],[37.2205,-1.7696],[37.2068,-1.7754],[37.1601,-1.7802],[37.1415,-1.8121],[37.142,-1.8366],[37.1537,-1.8441],[37.1616,-1.8571],[37.163,-1.8711],[37.1518,-1.8875],[37.17,-1.9169],[37.182,-1.9233],[37.1862,-1.9345],[37.2227,-1.9334],[37.2341,-1.936],[37.2458,-1.9495],[37.2639,-1.9583],[37.2759,-1.9774],[37.2784,-1.9919],[37.2993,-2.0058],[37.3588,-2.0124],[37.3738,-2.0199],[37.452,-2.0738],[37.5352,-2.1057],[37.5503,-2.1264],[37.5625,-2.1253],[37.594,-2.1528],[37.6213,-2.1603],[37.6633,-2.1539],[37.6901,-2.1641],[37.6995,-2.1644],[37.7081,-2.1812],[37.7026,-2.1969],[37.6838,-2.2235],[37.6746,-2.2278],[37.6781,-2.2419],[37.6749,-2.2656],[37.6646,-2.2893],[37.6518,-2.2883],[37.6446,-2.2988],[37.6292,-2.3018],[37.608,-2.3003],[37.5973,-2.3109],[37.8495,-2.6039],[37.8781,-2.6592],[37.8907,-2.6735],[37.9009,-2.7024],[37.9215,-2.7043],[37.9304,-2.7236],[37.9243,-2.7409],[37.93,-2.7674],[37.9441,-2.7808],[37.9737,-2.7886],[38.1155,-2.712],[38.1282,-2.6987],[38.1499,-2.6995],[38.1615,-2.6799],[38.1679,-2.695],[38.1803,-2.7014],[38.2612,-2.7605],[38.2706,-2.77],[38.2945,-2.8042],[38.3199,-2.8331],[38.3512,-2.8869],[38.3816,-2.9182],[38.3954,-2.9271],[38.408,-2.9278],[38.4293,-2.9557],[38.4487,-2.9721],[38.4571,-2.9898],[38.4763,-2.9853],[38.5095,-2.9819],[38.5191,-2.9748],[38.5046,-2.9648],[38.4745,-2.9284],[38.4542,-2.8845],[38.4441,-2.8802],[38.445,-2.8682],[38.4271,-2.8482],[38.431,-2.839],[38.4255,-2.8172],[38.418,-2.8107],[38.4308,-2.7859],[38.4198,-2.7586],[38.4133,-2.7506],[38.3885,-2.6909],[38.382,-2.6634],[38.3661,-2.6481],[38.3616,-2.6298],[38.3469,-2.5893],[38.3379,-2.5849],[38.3308,-2.5621],[38.3217,-2.5481],[38.3205,-2.5304],[38.3103,-2.501],[38.301,-2.4984],[38.2867,-2.4809],[38.2817,-2.4511],[38.2712,-2.4215],[38.253,-2.4201],[38.2453,-2.4092],[38.2361,-2.4087],[38.2217,-2.3981],[38.2107,-2.3541],[38.1992,-2.3531],[38.1871,-2.3394],[38.1743,-2.3384],[38.146,-2.3208],[38.1233,-2.3177],[38.1088,-2.2998],[38.1103,-2.2843],[38.0845,-2.2639],[38.0697,-2.2474],[38.0671,-2.215],[38.0578,-2.2055],[38.0451,-2.1661],[38.0263,-2.1609],[38.0211,-2.1478],[37.9972,-2.1531],[37.9628,-2.1653],[37.9604,-2.1405],[37.9524,-2.1331],[37.9584,-2.0717],[37.952,-2.0569],[37.9486,-2.0352],[37.9414,-2.0357],[37.9384,-2.0118],[37.9283,-1.9972],[37.9125,-1.9543],[37.9076,-1.9324],[37.9162,-1.91],[37.9068,-1.9042],[37.8979,-1.8678],[37.8834,-1.8518],[37.8915,-1.842],[37.8472,-1.7979],[37.8377,-1.7792],[37.8403,-1.7679],[37.8535,-1.7639],[37.8549,-1.7544],[37.8429,-1.7115],[37.8351,-1.7106],[37.8368,-1.6907],[37.8194,-1.6784],[37.8219,-1.6696],[37.8038,-1.6528],[37.8034,-1.6426],[37.7828,-1.6094],[37.7712,-1.5829],[37.7533,-1.5664]]]},"properties":{"countyId":"makueni","name":"Makueni"}}
]}
}
