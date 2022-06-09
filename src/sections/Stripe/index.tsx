import React, { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { Layout, Spin } from "antd";
import {
  ConnectStripe as ConnectStripeData,
  ConnectStripeVariables,
} from "../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe";
import { CONNECT_STRIPE } from "../../lib/graphql/mutations";
import { Redirect, useHistory ,RouteComponentProps} from "react-router-dom";
import { Viewer } from "../../lib/types";
import { displaySuccessNotification } from "../../lib/utils";

const { Content } = Layout;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const Stripe = ({ viewer, setViewer,history }: Props & RouteComponentProps) => {




  const [connectStripe, { data, loading, error }] = useMutation<
    ConnectStripeData,
    ConnectStripeVariables
  >(CONNECT_STRIPE, {
    onCompleted: (data) => {
      if (data && data.connectStripe) {
        setViewer({
          ...viewer,
          hasWallet: data.connectStripe.hasWallet,
        });
        displaySuccessNotification(
            "You 've successfully connected your Stripe Account!",
            "You can now begin to create listings in the Host page."
          );
      }
    },
  });

  const refConnectStripe = useRef(connectStripe);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      refConnectStripe.current({
        variables: {
          input: {
            code,
          },
        },
      });
    } else{
        history.replace("/login");
    }
  }, [history]);

  if (data && data.connectStripe) {
    return <Redirect to={`/user/${viewer.id}`} />;
  }

  if (loading) {
    return (
      <Content className="stripe">
        <Spin size="large" tip="Connecting your stripe account..." />
      </Content>
    );
  }

  if (error) {
    return <Redirect to={`/user/${viewer.id}?stripe_error=true`} />;
  }

  return null;
};
