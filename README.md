# Cosmic Titanic - Kaggle Competition

https://www.kaggle.com/competitions/spaceship-titanic/

This repository contains the code and documentation for my submission to the "Cosmic Titanic" Kaggle competition.

## Introduction

The "Cosmic Titanic" competition is a binary classification problem where the goal is to predict whether passengers survived a cosmic disaster during their space journey. In this competition, we use machine learning techniques to analyze the provided dataset and make predictions.

## Dataset

The dataset consists of two main files:
- `train.csv`: This file contains the training data, including features and the target variable.
- `test.csv`: This file contains the test data, where predictions need to be made.

## Features

The following features were used for building the predictive model:
- `HomePlanet`: The planet of origin for the passenger.
- `CryoSleep`: Whether the passenger underwent cryosleep (binary).
- `Destination`: The destination planet for the journey.
- `Age`: Age of the passenger.
- `VIP`: Whether the passenger had VIP status (binary).
- `RoomService`: Whether room service was provided during the journey (binary).
- `FoodCourt`: Whether there was a food court on the space shuttle (binary).
- `ShoppingMall`: Whether there was a shopping mall on the space shuttle (binary).
- `Spa`: Whether there was a spa on the space shuttle (binary).
- `VRDeck`: Whether there was a virtual reality deck on the space shuttle (binary).

## Data Preprocessing

- Missing values were imputed using the K-nearest neighbors (KNN) imputer.
- Categorical features were one-hot encoded.

## Model Architecture

A feedforward neural network (ANN) model was used for classification, consisting of multiple hidden layers with ReLU activation functions and a final sigmoid output layer. The model was trained using binary cross-entropy loss and optimized with RMSprop.

## Model Evaluation

The model's performance was evaluated using the test dataset. The following metrics were used:
- Accuracy
- Confusion matrix
- Classification report

## Results

The model achieved an accuracy of f1- 0.81 on the test dataset. 

## Submission

The predictions for the test dataset were submitted to Kaggle, and the model achieved a rank of 63 % on the competition leaderboard.

## Usage

To train the model and make predictions, follow the steps in the Jupyter Notebook provided in this repository.

## Dependencies

- Python 3.9

## Acknowledgments

- Kaggle for hosting the "Cosmic Titanic" competition.
-- >> https://www.kaggle.com/competitions/spaceship-titanic

## Contact

Ismat Samadov
Email: ismetsemedov@gmail.com
LinkedIn: linkedin.com/in/ismat-samadov-42414b241
