#!/bin/bash

# Set variables
USER_POOL_ID="us-east-1_KdlIkeEqT"
CLIENT_ID="2ugphnui6blhifitnbthk2v1r1"
TEST_EMAIL="test-user@example.com"
TEST_USERNAME="testuser123"
TEST_PASSWORD="Test@123456"
FIRST_NAME="John"
LAST_NAME="Doe"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting BlockPulse Authentication Testing...${NC}"

# 1. Register a new user
echo -e "\n${YELLOW}1. Registering a new user...${NC}"
REGISTER_RESPONSE=$(aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username $TEST_USERNAME \
  --password $TEST_PASSWORD \
  --user-attributes Name=given_name,Value=$FIRST_NAME Name=family_name,Value=$LAST_NAME Name=email,Value=$TEST_EMAIL \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Registration successful!${NC}"
  echo "$REGISTER_RESPONSE"
else
  echo -e "${RED}Registration failed!${NC}"
  exit 1
fi

# 2. Get the confirmation code from the admin (since we can't access email in this test)
echo -e "\n${YELLOW}2. Getting confirmation code (admin only)...${NC}"
CONFIRMATION_CODE=$(aws cognito-idp admin-get-user \
  --user-pool-id $USER_POOL_ID \
  --username $TEST_USERNAME \
  --query 'UserAttributes[?Name==`email_code`].Value' \
  --output text \
  --region us-east-1)

if [ -z "$CONFIRMATION_CODE" ]; then
  echo -e "${YELLOW}No confirmation code found. Creating one for testing...${NC}"
  # Generate a random 6-digit code for testing
  CONFIRMATION_CODE=$(printf '%06d\n' $((RANDOM % 1000000)))
  
  # Set the confirmation code for the user (admin only)
  aws cognito-idp admin-update-user-attributes \
    --user-pool-id $USER_POOL_ID \
    --username $TEST_USERNAME \
    --user-attributes Name=email_code,Value=$CONFIRMATION_CODE \
    --region us-east-1
    
  echo -e "${GREEN}Created confirmation code: $CONFIRMATION_CODE${NC}"
else
  echo -e "${GREEN}Found confirmation code: $CONFIRMATION_CODE${NC}"
fi

# 3. Confirm the registration
echo -e "\n${YELLOW}3. Confirming registration...${NC}"
CONFIRM_RESPONSE=$(aws cognito-idp confirm-sign-up \
  --client-id $CLIENT_ID \
  --username $TEST_USERNAME \
  --confirmation-code $CONFIRMATION_CODE \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Registration confirmed!${NC}"
else
  echo -e "${RED}Registration confirmation failed!${NC}"
  # Try admin-confirm-sign-up as fallback
  echo -e "${YELLOW}Trying admin confirmation...${NC}"
  aws cognito-idp admin-confirm-sign-up \
    --user-pool-id $USER_POOL_ID \
    --username $TEST_USERNAME \
    --region us-east-1
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Admin confirmation successful!${NC}"
  else
    echo -e "${RED}Admin confirmation failed!${NC}"
    exit 1
  fi
fi

# 4. Login
echo -e "\n${YELLOW}4. Logging in...${NC}"
LOGIN_RESPONSE=$(aws cognito-idp initiate-auth \
  --client-id $CLIENT_ID \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=$TEST_USERNAME,PASSWORD=$TEST_PASSWORD \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Login successful!${NC}"
  # Extract tokens
  ID_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.AuthenticationResult.IdToken')
  ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.AuthenticationResult.AccessToken')
  REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.AuthenticationResult.RefreshToken')
  
  echo -e "${GREEN}Tokens received:${NC}"
  echo -e "ID Token: ${YELLOW}${ID_TOKEN:0:20}...${NC}"
  echo -e "Access Token: ${YELLOW}${ACCESS_TOKEN:0:20}...${NC}"
  echo -e "Refresh Token: ${YELLOW}${REFRESH_TOKEN:0:20}...${NC}"
else
  echo -e "${RED}Login failed!${NC}"
  exit 1
fi

# 5. Get User Info
echo -e "\n${YELLOW}5. Getting user info...${NC}"
USER_INFO=$(aws cognito-idp get-user \
  --access-token $ACCESS_TOKEN \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}User info retrieved:${NC}"
  echo "$USER_INFO"
else
  echo -e "${RED}Failed to get user info!${NC}"
fi

# 6. Refresh Token
echo -e "\n${YELLOW}6. Testing token refresh...${NC}"
REFRESH_RESPONSE=$(aws cognito-idp initiate-auth \
  --client-id $CLIENT_ID \
  --auth-flow REFRESH_TOKEN_AUTH \
  --auth-parameters REFRESH_TOKEN=$REFRESH_TOKEN \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Token refresh successful!${NC}"
  # Extract new tokens
  NEW_ID_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.AuthenticationResult.IdToken')
  NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.AuthenticationResult.AccessToken')
  
  echo -e "${GREEN}New tokens received:${NC}"
  echo -e "New ID Token: ${YELLOW}${NEW_ID_TOKEN:0:20}...${NC}"
  echo -e "New Access Token: ${YELLOW}${NEW_ACCESS_TOKEN:0:20}...${NC}"
else
  echo -e "${RED}Token refresh failed!${NC}"
fi

# 7. Forgot Password Flow
echo -e "\n${YELLOW}7. Testing forgot password flow...${NC}"
echo -e "${YELLOW}Initiating forgot password...${NC}"
FORGOT_RESPONSE=$(aws cognito-idp forgot-password \
  --client-id $CLIENT_ID \
  --username $TEST_USERNAME \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Forgot password initiated!${NC}"
  
  # Get confirmation code (admin only)
  echo -e "${YELLOW}Getting password reset code (admin only)...${NC}"
  RESET_CODE=$(aws cognito-idp admin-get-user \
    --user-pool-id $USER_POOL_ID \
    --username $TEST_USERNAME \
    --query 'UserAttributes[?Name==`email_code`].Value' \
    --output text \
    --region us-east-1)
  
  if [ -z "$RESET_CODE" ]; then
    echo -e "${YELLOW}No reset code found. Creating one for testing...${NC}"
    # Generate a random 6-digit code for testing
    RESET_CODE=$(printf '%06d\n' $((RANDOM % 1000000)))
    
    # Set the reset code for the user (admin only)
    aws cognito-idp admin-update-user-attributes \
      --user-pool-id $USER_POOL_ID \
      --username $TEST_USERNAME \
      --user-attributes Name=email_code,Value=$RESET_CODE \
      --region us-east-1
      
    echo -e "${GREEN}Created reset code: $RESET_CODE${NC}"
  else
    echo -e "${GREEN}Found reset code: $RESET_CODE${NC}"
  fi
  
  # Confirm forgot password
  echo -e "${YELLOW}Confirming password reset...${NC}"
  NEW_PASSWORD="NewTest@123456"
  CONFIRM_FORGOT_RESPONSE=$(aws cognito-idp confirm-forgot-password \
    --client-id $CLIENT_ID \
    --username $TEST_USERNAME \
    --password $NEW_PASSWORD \
    --confirmation-code $RESET_CODE \
    --region us-east-1)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Password reset successful!${NC}"
    
    # Try logging in with new password
    echo -e "${YELLOW}Logging in with new password...${NC}"
    NEW_LOGIN_RESPONSE=$(aws cognito-idp initiate-auth \
      --client-id $CLIENT_ID \
      --auth-flow USER_PASSWORD_AUTH \
      --auth-parameters USERNAME=$TEST_USERNAME,PASSWORD=$NEW_PASSWORD \
      --region us-east-1)
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Login with new password successful!${NC}"
    else
      echo -e "${RED}Login with new password failed!${NC}"
    fi
  else
    echo -e "${RED}Password reset confirmation failed!${NC}"
  fi
else
  echo -e "${RED}Forgot password initiation failed!${NC}"
fi

# 8. Logout (Global Sign Out)
echo -e "\n${YELLOW}8. Testing logout...${NC}"
LOGOUT_RESPONSE=$(aws cognito-idp global-sign-out \
  --access-token $ACCESS_TOKEN \
  --region us-east-1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Logout successful!${NC}"
else
  echo -e "${RED}Logout failed!${NC}"
fi

# 9. Check for duplicate users
echo -e "\n${YELLOW}9. Checking for duplicate users...${NC}"
USERS_WITH_EMAIL=$(aws cognito-idp list-users \
  --user-pool-id $USER_POOL_ID \
  --filter "email = \"$TEST_EMAIL\"" \
  --region us-east-1)

USER_COUNT=$(echo $USERS_WITH_EMAIL | jq '.Users | length')

if [ "$USER_COUNT" -eq 1 ]; then
  echo -e "${GREEN}No duplicate users found!${NC}"
else
  echo -e "${RED}Found $USER_COUNT users with the same email!${NC}"
  echo "$USERS_WITH_EMAIL"
fi

echo -e "\n${GREEN}Authentication testing completed!${NC}"
