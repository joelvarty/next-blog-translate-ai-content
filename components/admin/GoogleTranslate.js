import React, { useState, useEffect, useRef } from "react"


export default function GoogleTranslate() {

	const [processing, setProcessing] = useState(false)
	const [value, setValue] = useState("")
	const [height, setHeight] = useState(100)

	const [languages, setLanguages] = useState([])
	const [originalItem, setOriginalItem] = useState(null)
	const [custom, setCustom] = useState(null)
	const [auth, setAuth] = useState(null)

	const containerRef = useRef()

	useEffect(() => {
		//get the field ready to wait for messages from the parent
		console.log('Google Translate => Waiting for message from Agility CMS')
		window.addEventListener("message", function (e) {

			//only care about these messages
			if (e.data.type === 'setInitialProps') {
				console.log('Google Translate => initial props received Agility CMS')
				const auth = e.data.message.auth;
				const custom = e.data.message.custom;
				const fieldValue = e.data.message.fieldValue ? JSON.parse(e.data.message.fieldValue) : null;

				setLanguages(custom.languages.filter(l => l.LanguageCode !== auth.languageCode))
				setValue(fieldValue)
				setCustom(custom)
				setAuth(auth)
				setOriginalItem(custom.contentItem)

				initHeightEvents()
			} else if (e.data.type === "contentItemUpdate") {
				console.log('Google Translate => content item updated from Agility CMS', e.data)
				setOriginalItem(e.data.message.contentItem)
			} else {
				//show us the unhandled message...
				console.log("Google Translate => IGNORING MESSAGE FROM PARENT: ", e.data)
			}
		}, false);

		//let the parent know we are NOW ready to receive messages
		if (window.parent) {
			console.log("Google Translate => Notifying CMS this field is ready to receive messages...")
			window.parent.postMessage({
				message: "😀",
				type: 'fieldIsReady'
			}, "*")
		} else {
			console.log("can't post message to parent :(")
		}

	}, []);


	const heightChanged = (h, height, setHeight) => {
		if (h === height) return

		setHeight(h)

		if (window.parent) {
			window.parent.postMessage({
				message: h,
				type: 'setHeightCustomField'
			}, "*")
		}

	}

	const initHeightEvents = () => {
		//wait 200ms for initial height-sync

		window.setTimeout(function () {
			heightChanged(window.document.body.offsetHeight, height, setHeight)
		}, 200)

		//sync height every 1/2 second
		window.setInterval(function () {
			heightChanged(window.document.body.offsetHeight, height, setHeight)
		}, 500)
	}

	const translateTo = async () => {

		setProcessing(true)

		console.log(originalItem, custom.contentDefinitionFields)

		for (var fieldName in originalItem.Values) {
			const fieldSetting = custom.contentDefinitionFields.FieldSettings.find(fs => fs.FieldName === fieldName)
			if (! fieldSetting
				|| !(fieldSetting.FieldType === "Text" || fieldSetting.FieldType === "HTML"|| fieldSetting.FieldType === "LongText")
				|| !fieldSetting.IsDataField ) {
					continue;
				}
			const fieldValue = originalItem.Values[fieldName]
			if (!fieldValue || (typeof fieldValue !== "string")) continue

			console.log(fieldName, fieldValue)
		}

		setTimeout(function () {
			setProcessing(false)
		}, 2000)
	}

	return (
		<div className="text-sm h-20">
			<div className="mb-2">
				<span className="bg-yellow-200 text-yellow-500 p-1 rounded">Google Translate (Experimental)</span>
			</div>

			{originalItem && originalItem.ContentID <= 0 &&
				<div>Save this item to enable translation features.</div>
			}
			{originalItem && originalItem.ContentID > 0 &&

				<div>
					{!processing &&
						<div>
							<div>
								Translate this item to {auth.languageObj.LanguageName}.
							</div>
							<div>
								<button
									onClick={() => translateTo(0)}
									className="bg-gray-200 border border-gray-600 hover:bg-gray-300 text-gray-800 p-1 rounded">Translate</button>
							</div>
						</div>
					}

					{processing &&
						<div>
							<div className="animate-pulse">Working..</div>
						</div>
					}
				</div>
			}
		</div>
	)

}