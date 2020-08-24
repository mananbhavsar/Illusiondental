package com.laxmidental.app;

import android.content.Context;
import android.util.Log;
import android.util.StringBuilderPrinter;

import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;

import org.json.JSONException;

import me.leolin.shortcutbadger.ShortcutBadgeException;
import me.leolin.shortcutbadger.ShortcutBadger;

/**
 * Created by Mubasshir on 21/12/17.
 */

public class BadgeHelper extends NotificationExtenderService {
    private static String TAG = "FCM_BADGE_HELPER";
    public final static String CONST_BADGE_KEY = "badge";

    public static void setBadgeCount(String badge, Context ctx){
        try {
            //String badge = (String) remoteMessage.get("badge");
            int badgeCount = 0;
            if(badge!=null && !badge.isEmpty()){
                badgeCount = tryParseInt(badge);
            }
            if(badgeCount>0)
            {
                ShortcutBadger. applyCountOrThrow(ctx, badgeCount);
                Log.d(TAG, "showBadge worked!");
            }

        } catch (ShortcutBadgeException e) {
            Log.e(TAG, "showBadge failed: " + e.getMessage());
        }
    }
    static int tryParseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult notification) {
        try {
            String badge = notification.payload.additionalData.getString("badge");
            setBadgeCount(badge, this.getApplicationContext());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return false;
    }
}
