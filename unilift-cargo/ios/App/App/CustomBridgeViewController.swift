import UIKit
import Capacitor

class CustomBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
       super.viewDidLoad()
       webView!.allowsBackForwardNavigationGestures = true
    }
}
